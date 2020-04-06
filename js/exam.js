'use strict';

// Handle rendering list of available exams
function renderExams(displayLayer = true) {
    console.log('renderExams() has been used.');

    if (displayLayer) {
        showElements(['exams']);
        state = 'exams_rendered';
    }
    

    var exams = Object.values(allExams);
    var html = '';
    if (!('localStorage' in window)) {
        html += '<div class="alert alert-warning mb-2" role="alert">Changing options is disabled, because your browser does not support localStorage.</div>';
    }
    // print available exams or warning
    if (exams.length) {
        html += '<div class="list-group">';
        for (var i in exams) {
            html += prepareExam(exams[i]);
        }
        html += '</div>';
    } else {
        html += '<div class="alert alert-warning mb-2" role="alert">You need to load first challenge exam. Use application menu at bottom.</div>';
    }
    renderElement('#exams .list', html);

    // checking updates for questions
    for (var hash in examsHashes) {
        checkQuestions(examsHashes[hash]);
    }

    document.querySelectorAll('.delete-icon').forEach(function(elem) {
        elem.addEventListener('click', deleteExam);
    });

    // alert(state);

    // if (['challenge_started', 'challenge_finished', 'exam_result_rendered', 'exam_printed'].includes(state)) {
    //     // cancelChallenge();
    //     hideElements(['exams']);
    // } else {
    //     state = 'exams_rendered';
    // }
}

// Handle preparing single exam on list
function prepareExam(config, includeWrapper = true) {
    var valid = config.all-config.ignored;
    var html = '';
    html += includeWrapper ? '<article id="'+config.exam+'" class="list-group-item list-group-item-action flex-column align-items-start">' : '';
    html += (valid == 0 ? '<div class="alert alert-warning mb-2" role="alert">Challenge cannot be started, because has no valid questions.</div>' : '');
    html += '<div class="d-flex w-100 justify-content-between">'
        + '<h5 class="mb-1 d-flex align-items-start">'
        + '<span class="exam-name">'+config.exam.split('-').join(' ').toUpperCase()+'</span>'
        // + '<i class="icon sync-icon" data-exam="'+config.exam+'"></i>'
        + '</h5>'
        // + '<small>'+(config.all - config.ignored > config.questions ? config.questions : config.all - config.ignored)+' questions in '+config.duration+'min</small>'
        + '<small>'+(config.questions)+' questions in '+config.duration+'min</small>'
        + '</div>'
        + '<i class="icon delete-icon" data-exam="'+config.exam+'"></i>'
        + '<p class="mb-1">'+config.description+'</p>'
        // + '<small>'+config.all+' questions found'+(config.ignored > 0 ? ', but ' +config.ignored+ ' ignored or incomplete' : '')+'</small>'
        // + '<small>Notifications <span class="badge badge-secondary">4</span></small>'
        + 'Found <span class="badge badge-secondary">'+config.all+'</span> '
        + 'Valid <span class="badge badge-success">'+(valid)+'</span> '
        + 'Invalid <span class="badge badge-danger">'+config.ignored+'</span> ';
    html += includeWrapper ? '</article>' : '';
    return html;
}

// Handle deleting exam from list
function deleteExam(event) {
    console.log('deleteExam() has been used.');
    
    // maybe confirmation
    var exam = event.target.getAttribute('data-exam');

    $('#'+exam).fadeOut(1000, function() {
        $(this).remove();
        console.log('Exam has been deleted.');
    });

    removeLocalStorageItem('cm-'+exam);
    delete(allExams['cm-'+exam]);
    setLocalStorageItem('allExams', allExams, true);
    delete(examsHashes['cm-'+exam]);
    setLocalStorageItem('exaHashes', examsHashes, true);

    event.stopPropagation();

    state = 'exam_deleted';
}

// Handle selecting exam from available on list
function selectExam(event) {
    console.log('selectExam() has been used.');
    
    var node = event.target;
    
    while (node.tagName.toLowerCase() != 'article') {
        node = node.parentNode;
    }
    exam = 'cm-' + node.getAttribute('id');

    // console.log(exam);
    // console.log(localStorage.getItem(exam));
    // console.warn(questions.all.map(x => x.index));
    // if (questions.all.length == 0) {
        parseChallenge(localStorage.getItem(exam));
    // }
    // console.warn(questions.all.map(x => x.index));

    if (properties['app_ui_start_challenge_after_selecting']) {
        startChallenge();
    } else {
        enableAction('start');
        enableAction('print');
    }

    state = 'exam_selected';
}

function parseChallenge(content) {
    console.log('parseChallenge() has been used.');
    
    parser.init();
    parser.parse(content);

    questions.all = parser.questions;
    exam = 'cm-' + parser.examConfig.exam;
    // console.log(exam);

    // console.log(allExams);
    // console.log(allExams[exam]);
    allExams[exam] = parser.examConfig;
    
    // store exam in localStorage for the future
    if ('localStorage' in window) {
        // if (!localStorage.getItem(exam)) {
            localStorage.setItem(exam, content);
        // }
        localStorage.setItem('allExams', JSON.stringify(allExams));
    }
    // triggerAction('start');
    // state = 'challenge_parsed';
}

// Handle displaying questions for exam in print mode
function printExam(event) {
    console.log('printExam() has been used.');
    if ($('#print-button').hasClass('disabled')) {
        return;
    }

    console.log('Print event has been triggered.');
    initChallenge(properties['print_questions.skip_ignore_']);
    // generate first questions
    // generateQuestion(questions.used[challenge]);
    hideElement('#exams');
    showElement('.challenge');
    var html = '';
    for (var q in questions.all) {
        html += printQuestion(questions.all[q], parseInt(q));
    }

    renderElement('.challenge', html);

    // hideElement('#start');
    // hideElement('#print');
    // hideElement('#show-options');
    disableAction('start');
    disableAction('print');

    state = 'exam_printed';
}

// Handle rendering result of finished challenge
function renderExamResult() {
    console.log('renderExamResult() has been used.');
    
    hideElements(['challenge', 'progress', 'timer']);
    
    showElement('.result');


    var summary = validateExamAnswers();
    var score = summary.score;
    var title;
    var subtitle;
    var image;

    var html = '';

    if (score == 100) {
        title = 'Perfect';
        subtitle = 'Your score is %d%. Will you repeat this?';
        image = 'passed';
    }
    if (score >= 80 && score < 100) {
        title = 'Great';
        subtitle = 'Your score is %d%. You would pass exam.';
        image = 'passed';
    }
    if (score >= 50 && score < 80) {
        title = 'Not good';
        subtitle = 'Your score is %d%. You can do it better.';
        image = 'failed';
    }
    if (score < 50) {
        title = 'Poor';
        subtitle = 'Your score is %d%. You have to do it better.';
        image = 'failed';
    }
    if (score == 0) {
        title = 'Terrible';
        subtitle = 'Your score is %d%. Start to learn wise.';
        image = 'epic-fail';
    }


    html += '<div class="row">';
    html += '<div class="col mb-3">';
    html += '<div class="card text-center">';
    // html += '<div class="card text-center col-sm-6 col-md-6  col-lg-8  col-xl-12">';
    html += '   <div class="card-header">';
    html +=  allExams[exam].exam + 'exam result';
    // html +=  ' Service Mapping exam result';
    html += '   </div>';
    html += '   <div class="card-body">';
    html += '       <img src="./img/'+image+'.png" class="col-sm-6">';
    html += '       <h1 class="card-title">'+title+'</h1>';
    html += '       <p class="card-text">'+subtitle.replace('%d%', '<strong>'+score+'%</strong>')+'</p>';
    // html += '<a href="#" class="btn btn-primary">Go somewhere</a>';
    html += '   </div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row row-cols-1 row-cols-md-2">';
    html += '   <div class="col mb-3 col-sm-6 col-md-6">';
    // html += '      <div class="card-deck">';
    html += '         <div class="card h-100 text-center text-success border-success">';
    // html += '             <div class="card-header">Corrent</div>';
    html += '             <div class="card-body">';
    html += '                 <h1 class="card-title">'+summary.correct.length+'</h1>';
    html += '                 <p class="card-text">Questions answered correctly.</p>';
    html += '             </div>';
    html += '         </div>';
    // html += '      </div>';
    html += '   </div>';
    html += '   <div class="col mb-3 col-sm-6 col-md-6">';
    html += '       <div class="card h-100 text-center text-danger border-danger">';
    // html += '           <div class="card-header">Mistakes</div>';
    html += '           <div class="card-body">';
    html += '              <h1 class="card-title">'+summary.wrong.length+'</h1>';
    html += '               <p class="card-text">Questions with incorrect or missing answer.</p>';
    html += '           </div>';
    html += '       </div>';
    html += '   </div>';
    html += '</div>';

    // renderElement('.result', result + '<p class="advice">' + advice + '</p>' + html);
    renderElement('.result', html);

    state = 'exam_result_rendered';
}

// Handle exams cleanup
function removeAllExams(event) {
    console.log('removeAllExams() has been used.');

    var html = '';
    for (var exam in allExams) {
        removeLocalStorageItem(exam);
    }
    removeLocalStorageItem('allExams');
    removeLocalStorageItem('examsHashes');
    
    html += 'All exams have been removed.';
    console.log('All exams and related variables have been removed.');
    
    questions = {
        'all': [],
        'used': [],
        'exam': [],
        'ignored': []
    };
    challenge = undefined;
    limit = undefined;
    displayTimer = undefined;
    
    keyEventEnabled = false;
    
    allExams = {};
    examsHashes = {};
    availableExams = [];
    
    errors = [];
    
    exam = undefined;
    time = undefined;

    renderExams();
    renderElement('.settings-messages', html);
}
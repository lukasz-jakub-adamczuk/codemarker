'use strict';

// Handle rendering list of available exams
function renderExams(displayLayer = true) {
    console.log('renderExams() has been used.');

    if (displayLayer) {
        showElements(['exams']);
        state = 'exams_rendered';
    }
    

    var html = '';
    var exams;
    if (allExams) {
        exams = Object.values(allExams);
        
        if (!('localStorage' in window)) {
            html += warning(getMessage('msg_options_change_disabled', 'Changing options is disabled, because your browser does not support localStorage.'));
        }
        // print available exams or warning
        if (exams.length) {
            html += '<div class="list-group">';
            for (var i in exams) {
                html += prepareExam(exams[i]);
            }
            html += '</div>';
        // } else {
        //     html += warning('msg_no_exams', 'You need to load first challenge exam. Use application menu at bottom.');
        }
    } else {
        html += warning(getMessage('msg_no_exams', 'You need to load first challenge exam. Use application menu at bottom.'));
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
    var questionsInExam = getMessage('questions_in_exam', '%d questions in %d min', [config.questions, config.duration]);
    var valid = config.all - config.ignored;
    var html = '';
    html += includeWrapper ? '<article id="'+config.exam+'" class="list-group-item list-group-item-action flex-column align-items-start">' : '';
    html += (valid == 0 ? warning(getMessage('msg_exam_invalid', 'Challenge cannot be started, because has no valid questions.')) : '');
    html += '<div class="d-flex w-100 justify-content-between">'
        + '<h5 class="mb-1 d-flex align-items-start">'
        + '<span class="exam-name">'+config.exam.split('-').join(' ').toUpperCase()+'</span>'
        // + '<i class="icon sync-icon" data-exam="'+config.exam+'"></i>'
        + '</h5>'
        // + '<small>'+(config.all - config.ignored > config.questions ? config.questions : config.all - config.ignored)+' questions in '+config.duration+'min</small>'
        + '<small>' + questionsInExam + '</small>'
        + '</div>'
        + '<i class="icon delete-icon" data-exam="'+config.exam+'"></i>'
        + '<p class="mb-1">'+config.description+'</p>'
        // + '<small>'+config.all+' questions found'+(config.ignored > 0 ? ', but ' +config.ignored+ ' ignored or incomplete' : '')+'</small>'
        // + '<small>Notifications <span class="badge badge-secondary">4</span></small>'
        + getMessage('found', 'Found') + ' <span class="badge badge-secondary">'+config.all+'</span> '
        + getMessage('valid', 'Valid') + ' <span class="badge badge-success">'+(valid)+'</span> '
        + getMessage('invalid', 'Invalid') + ' <span class="badge badge-danger">'+config.ignored+'</span> ';
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

// Handle repeating exam
function repeatExam() {
    var examStorage = getLocalStorageItem('examStorage');
    
    questions = examStorage['questions'];
    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
    errors = [];
    
    
    
    // errors = examStorage['errors'];
    exam = examStorage['exam'];
    time = getTime();
    startChallenge(null, false);
}

// Handle retrying exam
function retryExam() {
    startChallenge();
}

// Handle storing exam
function storeExam() {
    var examStorage = {};
    examStorage['questions'] = questions;
    examStorage['challenge'] = challenge;
    examStorage['limit'] = limit;
    examStorage['displayTimer'] = displayTimer;
    // examStorage['allExams'] = allExams;
    // examStorage['examsHashes'] = examsHashes;
    // examStorage['availableExams'] = availableExams;
    
    examStorage['errors'] = errors;
    examStorage['exam'] = exam;
    examStorage['time'] = time;
    setLocalStorageItem('examStorage', examStorage);
    console.log('Exam has been saved in localStorage.')
}

// Handle restoring exam if terminated
function restoreExam() {
    var examStorage = getLocalStorageItem('examStorage');
    // var answer = confirm('Do you want to restore saved exam?');

    // if (properties['allow_quiz_restoration']) {
        // if (properties['quiz_auto_restoration'] || confirm('Do you want to restore saved exam?')) {
        if (properties['quiz_auto_restoration']) {
            console.log('Exam has been restored.');
            questions = examStorage['questions'];
            challenge = examStorage['challenge'];
            limit = examStorage['limit'];
            displayTimer = examStorage['displayTimer'];
            // allExams = examStorage['allExams'];
            // examsHashes = examStorage['examsHashes'];
            // availableExams = examStorage['availableExams'];
            
            errors = examStorage['errors'];
            exam = examStorage['exam'];
            time = examStorage['time'];
            startChallenge(null, false);
            // removeLocalStorageItem('examStorage');
        }
    // }
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

function backToChallenge(id, mode, type) {
    hideElements(['result']);

    generateQuestion(questions.used[id], parseInt(id), type, mode);

    showElements(['challenge']);
}

// Handle rendering review for running challenge
function renderReviewResult() {
    console.log('renderExamResult() has been used.');

    hideElements(['challenge']);
    
    showElement('.result');

    var column = Math.ceil(questions.used.length / 3);
    
    var html = '';
    var answered = questions.exam.filter(el => el != undefined).length;
    var missing = questions.used.length - answered;
    var marked = questions.marked.filter(el => el == true).length;
    var onclick, ignored;

    html += '<div class="container">';
    html += '<div>' + getMessage('answered_in_total', 'Answered in total') + ': <strong>'+answered+'</strong></div>';
    html += '<div>' + getMessage('missing_answers', 'Missing answers') + '  : <strong>'+missing+'</strong></div>';
    html += '<div>' + getMessage('marked_for_review', 'Marked for review') + ': <strong>'+marked+'</strong></div>';
    html += '<div class="row">';
    for (var q in questions.used) {
        q = parseInt(q);
        if (q % column == 0) {
            html += '<div class="col-sm-4">';
        }
        var answers = [];
        for (var ans in questions.exam[q+1]) {
            if (questions.exam[q+1][ans] == true) {
                answers.push(letters[ans].toUpperCase());
            }
        }
        var markedForReview = questions.marked[q] ? '*' : '';
        onclick = 'onclick="javascript:backToChallenge(this.getAttribute(\'data-id\'));"';
        ignored = (questions.used[q].params.status && questions.used[q].params.status == 'ignored') ? '<span class="badge badge-danger">'+getMessage('ignored', 'Ignored')+'</span>' : '';

        html += '';
        html += '<div>';
        html += '    <a id="r'+q+'" href="#" data-id="'+q+'" '+onclick+' class="review-question">'+(q+1)+'. '+answers.join(', ')+' '+markedForReview + ignored + '</a>';
        html += '</div>';
        if ((q+1) % column == 0) {
            html += '</div>';
        }
    }
    html += '</div>';
    html += '</ul>';

    // html += '<button id="additional-review" onclick="javascript:backToChallenge(challenge);" class="btn btn-secondary">back to challenge</button>';

    renderElement('.result', html);
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
    
    html += info(getMessage('msg_exams_removed', 'All exams have been removed.'));
    console.log('All exams and related variables have been removed.');
    
    questions = {
        'all': [],
        'used': [],
        'exam': [],
        'ignored': [],
        'marked': [],
        'answered': []
    };
    challenge = undefined;
    limit = undefined;
    displayTimer = undefined;
    saverTimer = undefined;
    
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
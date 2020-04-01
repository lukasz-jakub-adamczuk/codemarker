'use strict';

// Handle rendering list of available exams
function renderExams() {
    console.log('renderExams() has been used.');
    // hideElements();
    showElements(['exams']);

    var exams = Object.values(allExams);
    var html = '';
    if (!('localStorage' in window)) {
        html += '<div class="alert alert-warning" role="alert">Changing options is disabled, because your browser does not support localStorage.</div>';
    }
    // print available exams or warning
    if (exams.length) {
        html += '<div class="list-group">';
        for (var i in exams) {
            html += '<span id="'+exams[i].exam+'" class="list-group-item list-group-item-action flex-column align-items-start">'
                + '<div class="d-flex w-100 justify-content-between">'
                + '<h5 class="mb-1">'+exams[i].exam.split('-').join(' ').toUpperCase()+'</h5>'
                + '<small>'+(exams[i].all - exams[i].ignored > exams[i].questions ? exams[i].questions : exams[i].all - exams[i].ignored)+' questions in '+exams[i].duration+'min</small>'
                + '</div>'
                + '<p class="mb-1">'+exams[i].description+'</p>'
                + '<small>'+exams[i].all+' questions found'+(exams[i].ignored > 0 ? ', but ' + exams[i].ignored + ' ignored or incomplete' : '')+'</small>'
            + '</span>';
        }
        html += '</div>';
    } else {
        html += '<div class="alert alert-warning" role="alert">You need to load first challenge exam. Use application menu at bottom.</div>';
    }
    renderElement('#exams .list', html);
}

// Handle selecting exam from available on list
function selectExam(event) {
    var node = event.target;
    
    while (node.tagName.toLowerCase() != 'span') {
        node = node.parentNode;
    }
    exam = 'cm-' + node.getAttribute('id');

    // console.log(exam);
    // console.log(localStorage.getItem(exam));
    console.warn(questions.all.map(x => x.index));
    // if (questions.all.length == 0) {
        parseChallenge(localStorage.getItem(exam));
    // }
    console.warn(questions.all.map(x => x.index));

    if (properties['app.ui.start_challenge_after_selecting']) {
        startChallenge();
    } else {
        enableAction('start');
        enableAction('print');
    }
}


function parseChallenge(content) {
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
}

// Handle displaying questions for exam in print mode
function printExam(event) {
    console.log('printExam() has been used.');
    if ($('#print-button').hasClass('disabled')) {
        return;
    }

    console.log('Print event has been triggered.');
    initChallenge(properties['print.questions.skip_ignored']);
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
}

// Handle rendering result of finished challenge
function renderExamResult() {
    console.log('renderExamResult() has been used.');
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

}
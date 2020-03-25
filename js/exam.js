'use strict';

// Handle rendering list of available exams
function renderExams() {
    console.log('Rendering available exams.');

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
                + '<small>'+exams[i].all+' questions available'+(exams[i].ignored > 0 ? ', ' + exams[i].ignored + ' questions ignored' : '')+'</small>'
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
    if (questions.all.length == 0) {
        parseChallenge(localStorage.getItem(exam));
    }

    if (properties['app.ui.start_challenge_after_selecting']) {
        startChallenge();
    } else {
        enableAction('#start');
        enableAction('#print');
    }
}


function parseChallenge(content) {
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
function printExam() {
    initChallenge(properties['print.questions.skip_ignored']);
    // generate first questions
    // generateQuestion(questions.used[challenge]);
    hideElement('#exams');
    showElement('.challenge');
    var html = '';
    for (var q in questions.used) {
        html += generateQuestion(questions.used[q], 'print');
    }

    renderElement('.challenge', html);

    // hideElement('#start');
    // hideElement('#print');
    // hideElement('#show-options');
    disableAction('#start');
    disableAction('#print');
}

// Handle rendering result of finished challenge
function renderExamResult() {
    var score = validateExamAnswers();
    var result;
    var advice;

    if (score >= 80) {
        result = '<div class="result passed"></div>';
        advice = 'Your score is '+score+'%. Congratulations!';
    }
    if (score > 50 && score < 80) {
        result = '<div class="result failed"></div>';
        advice = 'Your score is '+score+'%. Try again.';
    }
    if (score < 50) {
        result = '<div class="result epic-fail"></div>';
        advice = 'Your score is '+score+'% only. Learn more.';
    }
    renderElement('.challenge', result + '<p class="advice">' + advice + '</p>');
}
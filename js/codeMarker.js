// Handle starting new challenge for user
function startChallenge(event) {
    console.log('startChallenge() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    console.log('Start event has been triggered.');
    enableKeyEvents();
    hideElement('#exams');
    // if results has been displayed
    hideElement('#result');
    disableAction('stop');
    showElement('.challenge');
    // enable nav buttons
    enableAction('next');
    enableAction('answers');
    // reset used questions
    initChallenge(properties['quiz.questions.skip_ignored']);
    renderProgress(0);
    // generate first questions
    generateQuestion(questions.used[challenge]);
    
    // start timer
    time = allExams[exam].duration * 60;
    renderTimer();
    // start interval
    displayTimer = setInterval(function() {
        time--;
        renderTimer();
        if (properties['app.ui.display_timer'] && time <= 0) {
            finishChallenge();
        }
    }, 1000);
    // event.preventDefault();

    disableAction('start');
    disableAction('print');
}

// Internal function to init challenge
function initChallenge(skip_ignored) {
    // if (properties['quiz.questions.shuffle']) {
    //     questions.all = shuffleArray(questions.all);
    // }
    // skip ignored
    console.log(questions.all.length);
    if (skip_ignored) {
        questions.used = questions.all.filter(function(elem, index, array) { return elem.params.status != 'ignored'; }).slice(0);
    } else {
        questions.used = questions.all.slice(0);
    }
    console.log(questions.all === questions.used);
    console.log(questions.all.length);
    console.log(questions.used.length);
    var ignored = questions.all.filter(function(elem, index, array) { return elem.params.status == 'ignored'; }).slice(0);
    var questionsForExam;
    if (questions.used.length > allExams[exam].questions) {
        questionsForExam = allExams[exam].questions;
    } else {
        questionsForExam = questions.used.length;
    }
    console.warn(questions.all.map(x => x.index));
    if (properties['quiz.questions.shuffle']) {
        questions.used = shuffleArray(questions.used);
    }
    console.warn(questions.all.map(x => x.index));
    // questions.used = reorderArray(questions.used);
    questions.used = questions.used.slice(0, questionsForExam);
    // questions.used = reorderArray(questions.all);
    
    console.warn(questions.all.map(x => x.index));

    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
    errors = [];
}

// Handle finishing running challenge
function finishChallenge() {
    console.log('finishChallenge() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    console.log('Stop event has been triggered.');
    clearInterval(displayTimer);
    // hide nav buttons
    disableAction('prev');
    disableAction('next');
    disableAction('answers');
    disableAction('stop');
    disableKeyEvents();

    enableAction('start');
    
    
    // renderExamResult();
    runSpinner('renderExamResult');
}

// Handle generating question
function generateQuestion(q, mode) {
    // var answers;
    var html = '';
    // var id = '';
    // var answer = '';
    // var matching = '';
    // var checked = false;
    // var answerClass;
    // var q.index = challenge;

    console.log(q);
    console.log(q.params);

    if (mode != 'print') {
        html += '<div class="challenge-header">';
        html += '<b class="_text-muted _badge _badge-secondary question-number">Question ' + (challenge + 1) + '</b>';
        html += (q.params.area ? ' <span class="_badge _badge-secondary tag"> ' + q.params.area + '</span>' : '');
        
        if (q.params.comment) {
            // html += '<button type="button" class="btn btn-primary icon comment-icon" data-toggle="modal" data-target="#comment-modal"></button>';
            html += '<span class="icon comment-icon" data-toggle="modal" data-target="#comment-modal"></span>';
            renderElement('#comment-modal .modal-body', marked(q.params.comment));
        }
        if (q.params.image) {
            // html += '<button type="button" class="btn btn-primary icon comment-icon" data-toggle="modal" data-target="#comment-modal"></button>';
            html += '<span class="icon image-icon" data-toggle="modal" data-target="#image-modal"></span>';
            renderElement('#image-modal .modal-body', '<img class="question-image" src="'+q.params.image+'">');
        }
        html += '</div>';
    }
    
    if ('type' in q.params) {
        if (q.params.type == 'input') {
            html += prepareInputQuestion(q, mode);
        }
        if (q.params.type == 'matching') {
            html += prepareMatchingQuestion(q, mode);
        }
        if (q.params.type == 'single' || q.params.type == 'multiple') {
            html += prepareSimpleQuestion(q, mode);
        }
    }

    html += '<div class="question-errors">';
    html += renderErrors(challenge-1, true);
    html += '</div>';
    

    var scale = 100;
    // scale question
    // if (q.length > 512) {
    //     scale = 100;
    // } else if (q.length > 256 && q.length <= 512) {
    //     scale = 125;
    // } else {
    //     scale = 150;
    // }

    

    if (mode == 'print') {
        return html;
    };
    renderElement('.challenge', '<div style="font-size: '+scale+'%;">' + html + '</div>');
}


function printQuestion(q, index) {
    var html = '';
    
    if ('type' in q.params) {
        if (q.params.type == 'input') {
            html += printInputQuestion(q, index);
        }
        if (q.params.type == 'matching') {
            html += printMatchingQuestion(q, index);
        }
        if (q.params.type == 'single' || q.params.type == 'multiple') {
            html += printSimpleQuestion(q, index);
        }
    }
  
    return html;
}





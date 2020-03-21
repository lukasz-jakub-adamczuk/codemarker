// Handle starting new challenge for user
function startChallenge(event) {
    console.log('Start event has been triggered.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    enableKeyEvents();
    hideElement('#exams');
    showElement('.challenge');
    // enable nav buttons
    enableAction('#next');
    enableAction('#answers');
    // reset used questions
    initChallenge();
    renderProgress(0);
    // generate first questions
    generateQuestion(questions.used[challenge]);
    
    // start timer
    time = allExams[exam].duration * 60;
    timer();
    // start interval
    displayTimer = setInterval(function() {
        time--;
        timer();
        if (time <= 0) {
            finishChallenge();
        }
    }, 1000);
    // event.preventDefault();

    disableAction('#start');
    disableAction('#print');
}

// Internal function to init challenge
function initChallenge() {
    if (properties['quiz.questions.shuffle']) {
        questions.all = shuffleArray(questions.all);
    }
    // skip ignored
    questions.used = questions.all.filter(function(elem, index, array) { return elem.params.status != 'ignored'; });
    var ignored = questions.all.filter(function(elem, index, array) { return elem.params.status == 'ignored'; });
    var questionsForExam;
    if (questions.used.length > allExams[exam].questions) {
        questionsForExam = allExams[exam].questions;
    } else {
        questionsForExam = questions.used.length;
    }
    questions.used = reorderArray(questions.used.slice(0, questionsForExam));
    // questions.used = reorderArray(questions.all);
    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
}

// Handle finishing running challenge
function finishChallenge() {
    clearInterval(displayTimer);
    // hide nav buttons
    disableAction('#prev');
    disableAction('#next');
    disableAction('#answers');
    disableKeyEvents();

    enableAction('#start');
    
    renderExamResult();
}

// Handle generating question
function generateQuestion(q, mode) {
    var answers;
    var html = '';
    var id = '';
    var answer = '';
    var matching = '';
    var checked = false;
    var answerClass;

    console.log(q);

    if (mode != 'print') {
        html += '<div class="challenge-header">';
        html += '<b class="_text-muted _badge _badge-secondary question-number">Question ' + q.index + '</b>';
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
    if (errors[q.index-1]) {
        for (var error of errors[q.index-1]) {
            html += '<div class="alert alert-danger" role="alert">'+error+'</div>';
        }
    }
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





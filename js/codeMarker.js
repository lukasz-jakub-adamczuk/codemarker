// Handle starting new challenge for user
function startChallenge(event) {
    console.log('startChallenge() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    console.log('Start event has been triggered.');

    // reset used questions
    if (initChallenge(properties['quiz_questions_skip_ignored'])) {
        enableKeyEvents();
        hideElement('#exams');
        // if results has been displayed
        hideElement('#result');
        disableAction('stop');
        showElement('.challenge');
        showElement('#timer');
        if (properties['app_ui_display_progress']) {
            showElement('#progress');
        }
        if (properties['app_ui_display_timer']) {
            showElement('#timer');
        }
        // enable nav buttons
        enableAction('next');
        enableAction('answers');
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
            if (properties['app_ui_display_timer'] && time <= 0) {
                finishChallenge();
            }
        }, 1000);
        // event.preventDefault();

        disableAction('start');
        disableAction('print');

        state = 'challenge_started';
    }
}

// Internal function to init challenge
function initChallenge(skip_ignored) {
    if (skip_ignored) {
        questions.used = questions.all.filter(function(elem, index, array) { return elem.params.status != 'ignored'; }).slice(0);
    } else {
        questions.used = questions.all.slice(0);
    }
    
    var ignored = questions.all.filter(function(elem, index, array) { return elem.params.status == 'ignored'; }).slice(0);
    var questionsForExam;
    if (questions.used.length > allExams[exam].questions) {
        questionsForExam = allExams[exam].questions;
    } else {
        questionsForExam = questions.used.length;
    }
    if (properties['quiz_questions_shuffle']) {
        questions.used = shuffleArray(questions.used);
    }
    questions.used = questions.used.slice(0, questionsForExam);
    
    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
    errors = [];

    return limit;
}

// Handle finishing running challenge
function finishChallenge(event) {
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
    if (properties['app_ui_animation_before_result']) {
        runSpinner('renderExamResult');
    } else {
        renderExamResult();
    }

    state = 'challenge_finished';
}

// Handle canceling running challenge
// used to stop challenge without showing results if needed
function cancelChallenge() {
    console.log('canelChallenge() has been used.');
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

}

// Handle generating question
function generateQuestion(q, mode) {
    var html = '';
    
    if (mode != 'print') {
        html += '<div class="challenge-header">';
        html += '<b class="_text-muted _badge _badge-secondary question-number">Question ' + (challenge + 1) + '</b>';
        html += (q.params.area ? ' <span class="_badge _badge-secondary tag"> ' + q.params.area + '</span>' : '');
        
        if (q.params.comment) {
            html += '<span class="icon comment-icon" data-toggle="modal" data-target="#comment-modal"></span>';
            renderElement('#comment-modal .modal-body', marked(q.params.comment));
        }
        if (q.params.image) {
            html += '<span class="icon image-icon" data-toggle="modal" data-target="#image-modal"></span>';
            renderElement('#image-modal .modal-body', '<img class="question-image" src="'+q.params.image+'">');
        }
        if (q.params.eqi && q.params.eri) {
            html += '<span class="icon database-icon" data-toggle="modal" data-target="#database-modal"></span>';
            renderElement('#database-modal .modal-body', marked('If this question looks broken then check how it looks in Excel file\n\nQuestion in Excel: '+q.params.eqi+'\n\nRow in Excel: '+q.params.eri));
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
    
    if (mode == 'print') {
        return html;
    };
    renderElement('.challenge', html);
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





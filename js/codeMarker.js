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
    if (!properties['quiz_questions_use_all']) {
    //     questions.used = questions.used.slice(0);
    // } else {
        questions.used = questions.used.slice(0, questionsForExam);
    }
    
    
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
function generateQuestion(q, idx) {
    console.log('idx in param: '+ idx);
    var idx = idx === 0 ? 0 : idx || challenge;
    console.log('idx in var: '+ idx);
    var html = '';
    console.log('challenge in var: '+ challenge);
    challenge = idx;
    console.log('challenge in var: '+ challenge);
    
    html += '<div class="challenge-header">';
    html += '<b class="_text-muted _badge _badge-secondary question-number">Question ' + (idx + 1) + ' <span class="_text-muted">/ '+questions.used.length+'</span></b>';
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
    
    if ('type' in q.params) {
        if (q.params.type == 'input') {
            html += prepareInputQuestion(q, idx+1);
        }
        if (q.params.type == 'matching') {
            html += prepareMatchingQuestion(q, idx+1);
        }
        if (q.params.type == 'single' || q.params.type == 'multiple') {
            html += prepareSimpleQuestion(q, idx+1);
        }
    }

    if (properties['quiz_questions_mark_for_review']) {
        // default value
        questions.marked[idx] = questions.marked[idx] || false; 
        var checked = questions.marked[idx];
        html += '<div class="mark-for-review">';
        html += '<div class="custom-control custom-checkbox">'
                    +'<input type="checkbox" id="review-'+idx+'" name="marker" class="custom-control-input" value=""'+(checked ? ' checked' : '')+'>'
                    +'<label class="custom-control-label" for="review-'+idx+'">Mark question for review</label>'
                +'</div>';
        html += '</div>';
    }

    html += '<div class="question-errors">';
    html += renderErrors(idx, true);
    html += '</div>';

    html += '<div class="additional-navigation">';
    html += '<div class="row">';
    html += '<div class="col text-right mb-3">';
    if (properties['app_ui_display_nav_below_questions']) {
        // html += '<div class="col-sm-12 col-md-4 text-right mb-3">';
        if (challenge != 0) {
            html += '<button id="additional-prev" onclick="javascript:prevQuestion();" class="btn btn-secondary">Prev</button>';
        }
        if (challenge != limit-1) {
            html += '<button id="additional-next" onclick="javascript:nextQuestion();" class="btn btn-secondary">Next</button>';
        }
        // html += '</div>';
    }
    if (properties['quiz_questions_mark_for_review']) {
        // html += '<div class="col-sm-12 col-md-8 text-right">'
        html += '<button id="additional-review" onclick="javascript:renderReviewResult();" class="btn btn-secondary">Review exam</button>';
        html += '<button id="additional-stop" onclick="javascript:finishChallenge();" class="btn btn-secondary">Submit exam</button>';
                // +'</div>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    // if (mode == 'print') {
    //     return html;
    // };
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





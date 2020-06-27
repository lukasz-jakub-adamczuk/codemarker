// Handle starting new challenge for user
function startChallenge(event, newExam = true) {
    console.log('startChallenge() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    console.log('Start event has been triggered.');

    // reset used questions
    if (initChallenge(properties['quiz_questions_skip_ignored'], newExam)) {
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
        if (challenge == 0) {
            disableAction('prev');
        } else {
            enableAction('prev');
        }
        if (challenge == limit-1) {
            disableAction('next');
        } else {
            enableAction('next');
        }
        enableAction('answers');
        // renderProgress(0);
        countProgress();
        // generate first questions
        generateQuestion(questions.used[challenge]);
        
        // start timer
        time = time || allExams[exam].duration * 60;
        renderTimer();
        // start interval
        displayTimer = setInterval(function() {
            time--;
            renderTimer();
            if (properties['app_ui_display_timer'] && time <= 0) {
                finishChallenge();
            }
        }, 1000);
        // store exam every minute to save running time
        saverTimer = setInterval(function() {
            storeExam();
        }, 60000);
        // event.preventDefault();

        disableAction('start');
        disableAction('print');

        state = 'challenge_started';
    }
}

// Internal function to init challenge
function initChallenge(skip_ignored, newExam = true) {
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

    if (properties['quiz_questions_use_all']) {
        questions.used = questions.used.slice(0);
    } else {
        var allSlices = Math.ceil(questions.used.length / questionsForExam);
        var slice = allExams[exam].slice || 0;
        slice = slice % allSlices;
        var singleSlice = Math.ceil(questions.used.length / allSlices);

        var selected = questions.used.slice(slice * singleSlice, (slice + 1) * singleSlice);

        var sliceDiff = questionsForExam - selected.length;

        if (sliceDiff > 0) {
            slice++;
            slice = slice % allSlices;
            allExams[exam].slice = slice;
            var nextSlice = questions.used.slice(slice * singleSlice, (slice + 1) * singleSlice);
            selected = selected.concat(shuffleArray(nextSlice).slice(0, sliceDiff));
        }
        setLocalStorageItem('allExam', allExams);

        questions.used = shuffleArray(selected);
    }
    
    if (newExam) {
        questions.exam = [];
        challenge = 0;
        limit = questions.used.length;
        errors = [];
    }

    return limit;
}

function testChallenge(skip_ignored = true, newExam = true) {
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
    
    // better selection
    var allSlices = Math.ceil(questions.used.length / questionsForExam);
    var slice = allExams[exam].slice || 0;
    slice = slice % allSlices;
    var singleSlice = Math.ceil(questions.used.length / allSlices);

    var selected = questions.used.slice(slice * singleSlice, (slice + 1) * singleSlice);

    var sliceDiff = questionsForExam - selected.length;

    if (sliceDiff > 0) {
        slice++;
        slice = slice % allSlices;
        allExams[exam].slice = slice;
        var nextSlice = questions.used.slice(slice * singleSlice, (slice + 1) * singleSlice);
        selected = selected.concat(shuffleArray(nextSlice).slice(0, sliceDiff));
    }
    setLocalStorageItem('allExam', allExams);

    questions.used = shuffleArray(selected);
    

    stats = getLocalStorageItem('stats') || [];

    for (var q in questions.all) {
        mapping[slugify(questions.all[q].name)] = q;
        if (!stats[q]) {
            stats[q] = 0;
        }
    }
    for (var q in questions.used) {
        stats[mapping[slugify(questions.used[q].name)]]++;
    }

    setLocalStorageItem('stats', stats);
    var str = 'salesperson,sales' + "\n";
    for (var s in stats) {
        str += s + ',' + stats[s] + "\n";
    }
    console.log(str);

}

// Handle finishing running challenge
function finishChallenge(event) {
    console.log('finishChallenge() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        renderMessage('Exam cannot be sumitted until all questions will be answered.', 'warning', '.question-messages', true);
        return;
    }
    console.log('Stop event has been triggered.');

    if (questions.exam.filter(el => el != undefined).length != limit) {
        renderMessage('Exam cannot be sumitted until all questions will be answered.', 'warning', '.question-messages', true);
        return;
    }
    
    clearInterval(displayTimer);
    clearInterval(saverTimer);
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
    clearInterval(saverTimer);
    // hide nav buttons
    disableAction('prev');
    disableAction('next');
    disableAction('answers');
    disableAction('stop');
    disableKeyEvents();

}

// Handle generating question
function generateQuestion(q, idx) {
    storeExam();
    console.log('challenge: '+ challenge);
    console.log('idx in param: '+ idx);
    var idx = idx === 0 ? 0 : idx || challenge;
    console.log('idx in var: '+ idx);
    var html = '';
    var image = '';
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
        if (q.params.image.indexOf('http') == -1) {
            image = 'data:image/jpg;base64,' + q.params.image;
        } else {
            image = q.params.image;
        }
        renderElement('#image-modal .modal-body', '<img class="question-image" src="'+image+'">');
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

    html += '<div class="question-messages"></div>';
    
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





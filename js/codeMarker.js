'use strict';

var timePromise;

// Handle starting new challenge for user
function startChallenge(event, newExam = true) {
    console.log('startChallenge() has been used.');
    var duration;
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
        if (properties['quiz_answers_help_button']) {
            enableAction('answers');
        }
        // renderProgress(0);
        countProgress();
        // generate first questions
        generateQuestion(questions.used[challenge]);
        
        // start timer
        time = time || getTime();
        renderTimer();

        timePromise = new Promise(function(timeRunOut, reject) {
            // start interval
            displayTimer = setInterval(function() {
                time--;
                if (time == 600) {
                    displayTimerElement.className += ' almost-ended';
                    console.log('time runs out -> 10min left.');
                }
                renderTimer();
                if (properties['app_ui_display_timer'] && time <= 0) {
                    // stopChallenge();
                    timeRunOut('time run out -> ready to submit challenge');
                    clearInterval(displayTimer);
                }
            }, 1000);
        });

        timePromise.then(function(msg) {
            console.log(msg);
        });

        // answersPromise = new Promise(function(resolve, reject) {});

        

        // Promise.all([timePromise, answersPromise]).then((values) => {
        //     console.log(values);
        //     console.warn('can submit exam');
        // });
        
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
    
    questions.ignored = questions.all.filter(function(elem, index, array) { return elem.params.status == 'ignored'; }).slice(0);

    // questions.filtered = questions.used.filter(elem => elem).slice(0);
    var questionsForExam;
    if (questions.used.length > allExams[exam].questions) {
        questionsForExam = allExams[exam].questions;
    } else {
        questionsForExam = questions.used.length;
    }

    if (properties['quiz_questions_use_all']) {
        questions.used = questions.used.slice(0);
        if (allFilters[exam].usage == 'none') {
            questions.used = questions.used.slice(0);
        }
        if (allFilters[exam].usage == 'version') {
            console.log(allFilters[exam].filters.version);
            var versions = Object.entries(allFilters[exam].filters.version).map(function(itm){ if (itm[1] == true) return itm[0] }).filter(itm => itm);
            console.warn(versions);
            questions.filtered = questions.used.filter(elem => versions.includes(elem.params.version));
            console.warn(questions.filtered);
    
            questions.used = questions.filtered.slice(0);
        }
        if (allFilters[exam].usage == 'area') {
            console.log(allFilters[exam].filters.area);
            var areas = Object.entries(allFilters[exam].filters.area).map(function(itm){ if (itm[1] == true) return itm[0] }).filter(itm => itm);
            console.warn(areas);
            // if (areas.includes('empty')) {
            //     questions.filtered = questions.used.filter(elem => areas.includes(elem.params.area) || !elem.params.area);
            // } else {
                questions.filtered = questions.used.filter(elem => areas.includes(elem.params.area));
            // }
            console.warn(questions.filtered);
    
            questions.used = questions.filtered.slice(0);
        }
        if (allFilters[exam].usage == 'both') {
            console.log(allFilters[exam].filters.version);
            var versions = Object.entries(allFilters[exam].filters.version).map(function(itm){ if (itm[1] == true) return itm[0] }).filter(itm => itm);
            console.warn(versions);
            
            console.warn(questions.filtered);

            console.log(allFilters[exam].filters.area);
            var areas = Object.entries(allFilters[exam].filters.area).map(function(itm){ if (itm[1] == true) return itm[0] }).filter(itm => itm);
            console.warn(areas);
            // if (areas.includes('empty')) {
            //     questions.filtered = questions.used.filter(elem => areas.includes(elem.params.area) || !elem.params.area);
            // } else {
                questions.filtered = questions.used.filter(elem => versions.includes(elem.params.version) || areas.includes(elem.params.area));
                // questions.filtered = questions.used.filter(elem => areas.includes(elem.params.area));
            // }
            console.warn(questions.filtered);
    
            questions.used = questions.filtered.slice(0);
        }
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
            selected = selected.concat(nextSlice.slice(0, sliceDiff));
        }
        setLocalStorageItem('allExam', allExams);

        questions.used = selected;
    }

    if (properties.quiz_questions_shuffle) {
        questions.used = shuffleArray(questions.used);
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

// Handle stoping running challenge
function stopChallenge(event) {
    console.log('stopChallenge() has been used.');
    console.warn(event);
    if (event) {
        if (event.type == 'dblclick') {
            if (confirm(getMessage('confirm_seriously', 'Seriously?'))) {
                finishChallenge();
            }
        }
        if (event.target.className.indexOf('disabled') != -1) {
            // renderMessage('This action is disbaled currently.', 'warning', '.question-messages', true);
            return;
        }
    }
    console.log('Stop event has been triggered.');

    if (!canStopChallenge()) {
        renderMessage(getMessage('msg_exam_cannot_be_submitted', 'Exam cannot be submitted until all questions will be answered.'), 'warning', '.question-messages', true);
        return;
    }

    finishChallenge();
}

function canStopChallenge() {
    return (questions.exam.filter(el => el != undefined).length == limit);
}

function finishChallenge() {
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

    state = 'challenge_stoped';
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
function generateQuestion(q, idx, type, mode = 'challenge') {
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
    // var q = q || questions.used[challenge];
    // var mode = 
    
    if (properties.app_ui_display_versions_and_tags) {
        html += '<div class="versions-and-tags">';
        var version = q.params.version == 'empty' ? getMessage('version_empty', 'empty') : q.params.version;
        var area = q.params.area == 'empty' ? getMessage('tag_empty', 'empty') : q.params.area;
        html += (version ? ' <span class="version-pill text-truncate" data-toggle="tooltip" data-placement="top" title="' + version + '"><em>' + version + '</em></span>' : '');
        html += (area ? ' <span class="tag-pill text-truncate" data-toggle="tooltip" data-placement="top" title="' + area + '"><em>' + area + '</em></span>' : '');
        html += '</div>';
    }

    html += '<div class="challenge-header">';
    html += '<b class="_text-muted _badge _badge-secondary question-number">' + getMessage('question', 'Question') + ' ' + (idx + 1) + ' <span class="_text-muted">/ '+questions.used.length+'</span></b>';
    html += (q.params.status ? '<span class="badge badge-danger ml-2">' + q.params.status + '</span>' : '');
    
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
    if (q.params.eqi || q.params.eri) {
        html += '<span class="icon database-icon" data-toggle="modal" data-target="#database-modal"></span>';
        var infoDesc = getMessage('info_desc', 'If this question looks broken then check how it looks in Excel file');
        var infoEri = getMessage('info_eri', 'Row in Excel');
        var infoEqi = getMessage('info_eqi', 'Question in Excel');
        
        renderElement('#database-modal .modal-body', marked(infoDesc + '\n\n'+infoEqi+': '+(q.params.eqi || '?')+'\n\n'+infoEri+': '+(q.params.eri || '?')));
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

    if (mode == 'challenge' && properties['quiz_questions_mark_for_review']) {
        // default value
        questions.marked[idx] = questions.marked[idx] || false; 
        var checked = questions.marked[idx];
        html += '<div class="mark-for-review">';
        html += '<div class="custom-control custom-checkbox">'
                    +'<input type="checkbox" id="review-'+idx+'" name="marker" class="custom-control-input review-question" value=""'+(checked ? ' checked' : '')+'>'
                    +'<label class="custom-control-label" for="review-'+idx+'">' + getMessage('mark_for_review', 'Mark question for review') + '</label>'
                +'</div>';
        html += '</div>';
    }

    html += '<div class="question-errors">';
    html += renderErrors(idx, true);
    html += '</div>';
    
    
    html += '<div class="additional-navigation">';
    html += '<div class="row">';
    html += '<div class="col text-right mb-3">';
    if (mode == 'challenge') {
        if (properties['app_ui_display_nav_below_questions']) {
            // html += '<div class="col-sm-12 col-md-4 text-right mb-3">';
            if (challenge != 0) {
                html += '<button id="additional-prev" onclick="javascript:prevQuestion();" class="btn btn-secondary">' + getMessage('prev_short', 'Prev') + '</button>';
            }
            if (challenge != limit-1) {
                html += '<button id="additional-next" onclick="javascript:nextQuestion();" class="btn btn-secondary">' + getMessage('next_short', 'Next') + '</button>';
            }
            // html += '</div>';
        }
        if (properties['quiz_questions_mark_for_review']) {
            // html += '<div class="col-sm-12 col-md-8 text-right">'
            html += '<button id="additional-review" onclick="javascript:renderReviewResult();" class="btn btn-secondary">' + getMessage('review_exam', 'Review exam') + '</button>';
            html += '<button id="additional-stop" onclick="javascript:stopChallenge(event);" ondblclick="javascript:stopChallenge(event);" class="btn btn-secondary">' + getMessage('submit_exam', 'Submit exam') + '</button>';
                    // +'</div>';
        }
    } else {
        html += '<button onclick="javascript:renderExamResultDetails(\''+type+'\');" class="btn btn-secondary">' + getMessage('back_to_result_details', 'Back to result details') + '</button>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';


    html += '<div class="question-messages"></div>';
    
    // if (mode == 'print') {
    //     return html;
    // };
    renderElement('.challenge', html);

    /*
    var elem = document.querySelector('.answers .custom-control-input');
    if (!elem) {
        elem = document.querySelector('.answers .custom-select');
    }
    if (elem) {
        elem.focus();
    }*/
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

        errors[index] = [];
        if (q.answers.choices.length == 0) {
            errors[index].push('This question is invalid, because has no available answers.');
        }
        if (q.answers.correct == 0) {
            errors[index].push('This question is invalid, because has no correct answer.');
        }

        html += '<div class="question-errors">';
        html += renderErrors(index, true);
        html += '</div>';
    }
  
    return html;
}





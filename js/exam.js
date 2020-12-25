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
    // if (allExams) {
        exams = Object.values(allExams);
        
        if (!('localStorage' in window)) {
            html += warning(getMessage('msg_options_change_disabled', 'Changing options is disabled, because your browser does not support localStorage.'));
        }
        // print available exams or warning
        if (exams.length) {
            html += '<div class="list-group" id="accordionExample">';
            for (var i in exams) {
                // console.log(exams[i]);
                defaultFilters(exams[i]);
                html += prepareExam(exams[i]);
            }
            html += '</div>';
        } else {
            html += warning(getMessage('msg_no_exams', 'You need to load first challenge exam. Use application menu at bottom.'));
        }
    // } else {
    //     html += warning(getMessage('msg_no_exams', 'You need to load first challenge exam. Use application menu at bottom.'));
    // }

    renderElement('#exams .list', html);
    

    // checking updates for questions
    for (var hash in examsHashes) {
        checkQuestions(examsHashes[hash]);
    }

    document.querySelectorAll('.delete-icon').forEach(function(elem) {
        elem.addEventListener('click', deleteExam, true);
    });

    document.querySelectorAll('.questions-filtering').forEach(function(elem) {
        elem.addEventListener('change', setFilteringOption, true);
    });

    document.querySelectorAll('.filter-tgr').forEach(function(elem) {
        elem.addEventListener('click', toggleFilters, true);
    });

    document.querySelectorAll('.filter').forEach(function(elem) {
        elem.addEventListener('click', filterExam, true);
    });

    // alert(state);

    // if (['challenge_started', 'challenge_finished', 'exam_result_rendered', 'exam_printed'].includes(state)) {
    //     // cancelChallenge();
    //     hideElements(['exams']);
    // } else {
    //     state = 'exams_rendered';
    // }
}
function prepareExam(config, includeWrapper = true) {
    var questionsInExam = getMessage('questions_in_exam', '%d questions in %d min', [config.questions, config.duration]);
    var valid = config.all - config.ignored;
    var exam = 'cm-' + config.exam;
    var html = '';
    var versionSelected;
    var versionLabel;
    var versionStyle;
    var areaSelected;
    var areaLabel;
    var areaStyle;
    var disabled;

    html += includeWrapper ? '<article id="heading-'+config.exam+'" class="list-group-item list-group-item-action flex-column align-items-start">' : '';
    html += (valid == 0 ? warning(getMessage('msg_exam_invalid', 'Challenge cannot be started, because has no valid questions.')) : '');
    html += '<div class="collapsed" data-toggle="collapse" data-target="#collapse-'+config.exam+'" aria-expanded="false" aria-controls="collapse-'+config.exam+'">';
    
    html += '<div class="d-flex w-100 justify-content-between">'
        + '<h5 class="mb-1 d-flex align-items-start">'
        + '<span class="exam-name">'+config.exam.split('-').join(' ').toUpperCase()+'</span>'
        // + '<i class="icon sync-icon" data-exam="'+config.exam+'"></i>'
        + '</h5>'
        // + '<small>'+(config.all - config.ignored > config.questions ? config.questions : config.all - config.ignored)+' questions in '+config.duration+'min</small>'
        + '<small>' + questionsInExam + '</small>'
        + '</div>'
        + '<i class="icon delete-icon" data-exam="heading-'+config.exam+'"></i>'
        + '<p class="mb-1">'+config.description+'</p>'
        // + '<small>'+config.all+' questions found'+(config.ignored > 0 ? ', but ' +config.ignored+ ' ignored or incomplete' : '')+'</small>'
        // + '<small>Notifications <span class="badge badge-secondary">4</span></small>'
        + getMessage('found', 'Found') + ' <span class="badge badge-secondary">'+config.all+'</span> '
        + getMessage('valid', 'Valid') + ' <span class="badge badge-success">'+(valid)+'</span> '
        + getMessage('invalid', 'Invalid') + ' <span class="badge badge-danger">'+config.ignored+'</span> ';

    html += '</div>';
    
    html += '<div id="collapse-'+config.exam+'" class="collapse mt-2" aria-labelledby="heading-'+config.exam+'" data-parent="#accordionExample">'
    // html += warning(getMessage('msg_filtering_disabled', 'Filtering questions by versions and tags is not supported yet. Options have been disabled.'));
    html += '<div class="advanced row">';

    html += '<div class="col-sm-12">';
    html += warning(getMessage('msg_filtering_info', 'Filtering questions is in testing phase still. It requires using all questions option enabled too.'));
    html += '</div>';

    // filtering
    var options = {
        'none': getMessage('filtering_opt_none', 'No filter'),
        'version': getMessage('filtering_opt_version', 'Filter questions by versions'),
        'area': getMessage('filtering_opt_area', 'Filter questions by tags'),
        'both': getMessage('filtering_opt_both', 'Filter questions by versions and tags')
    };
    var disabled;
    var selected = allFilters[exam].usage || 'none';
    // var selected = selected == 'none' ? ' selected=""' : '';

    html += '<select class="app-settings-control-choice questions-filtering" data-exam="'+exam+'">';
    for (var opt in options) {
        disabled = false;
        if (opt == 'both') {
            disabled = true;
        }
        html += '<option value="' + opt + '"'+(opt == selected ? ' selected=""' : '')+(disabled ? ' disabled=""' : '')+'>' + options[opt] + '</option>';
    }
    html += '</select>';

    versionSelected = Object.values(allFilters[exam].filters.version).every(val => val == true);
    versionLabel = versionSelected ? getMessage('unselect_filters', 'unselect all') : getMessage('select_filters', 'select all');
    versionStyle = ['version', 'both'].includes(selected) ? ' style="opacity: 1;"' : ' style="opacity: .1;"';
    disabled = ['version', 'both'].includes(selected) ? false : true;
    
    html += '<div id="version-'+config.exam+'-group" class="col-sm-12 col-md-6 pt-2"'+versionStyle+'>';
    html += '<h5>'+getMessage('filter_version', 'Versions')+' <small id="version-'+config.exam+'-group-tgr" class="filter-tgr" data-disabled="'+disabled+'" data-selected="'+versionSelected+'">'+versionLabel+'</small></h5>';
    html += '<ul class="list-group">';
    for (var v in config.version) {
        var id = config.exam + '-version-' + slugify(v);
        var label = v == 'empty' ? getMessage('filter_opt_empty', 'empty') : v;
        var answer = v;
        
        var checked = exam in allFilters ? allFilters[exam].filters.version[v] : true;
        // console.log(config.exam + '_' + v + '_' + allFilters[exam].filters.version[v]);
        
        html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
        html += '<div class="custom-control custom-checkbox">';
        html += '<input type="checkbox" id="'+id+'" data-filter="version" class="filter custom-control-input" value="'+answer+'"'+(checked ? ' checked' : '')+(disabled ? ' disabled' : '')+'>';
        html += '<label class="custom-control-label" for="'+id+'">'+ label + '</label>';
        html += '</div>';
        html += '<span class="badge bg-secondary rounded-pill">'+config.version[v]+'</span>';
        html += '</li>';
    }
    html += '</ul>';
    html += '</div>';
    
    areaSelected = Object.values(allFilters[exam].filters.area).every(val => val == true);
    areaLabel = areaSelected ? getMessage('unselect_filters', 'unselect all') : getMessage('select_filters', 'select all');
    areaStyle = ['area', 'both'].includes(selected) ? ' style="opacity: 1;"' : ' style="opacity: .1;"';
    disabled = ['area', 'both'].includes(selected) ? false : true;
    
    html += '<div id="area-'+config.exam+'-group" class="col-sm-12 col-md-6 pt-2"'+areaStyle+'>';
    html += '<h5>'+getMessage('filter_tag', 'Tags')+' <small id="area-'+config.exam+'-group-tgr" class="filter-tgr" data-disabled="'+disabled+'" data-selected="'+areaSelected+'">'+areaLabel+'</small></h5>';
    html += '<ul class="list-group">';
    for (var a in config.area) {
        var id = config.exam + '-area-' + slugify(a);
        var label = a == 'empty' ? getMessage('filter_opt_empty', 'empty') : a;
        var answer = a;
        // var exam = 'cm-' + config.exam;
        var checked = exam in allFilters ? allFilters[exam].filters.area[a] : true;
        // console.log(config.exam);
        // if (config.exam in allFilters) {
        //     console.log(config.exam + '_' + a + '_' + allFilters[exam].filters.area[a]);
        // }
        
        html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
        html += '<div class="custom-control custom-checkbox">';
        html += '<input type="checkbox" id="'+id+'" data-filter="area" class="filter custom-control-input" value="'+answer+'"'+(checked ? ' checked' : '')+(disabled ? ' disabled' : '')+'>';
        html += '<label class="custom-control-label" for="'+id+'">'+ label + '</label>';
        html += '</div>';
        html += '<span class="badge bg-secondary rounded-pill">'+config.area[a]+'</span>';
        html += '</li>';
    }
    html += '</ul>'; // element
    html += '</div>'; // section
    html += '</div>'; // row

    html += '</div>'; // collapse
    html += includeWrapper ? '</article>' : '';
    return html;
}

// Handle preparing single exam on list
function prepareExamOld(config, includeWrapper = true) {
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

function setFilteringOption(event/*, exam, filter*/) {
    console.log('setFilteringOption() has been used.');

    console.log(event);
    
    // var exam = exam;
    // var filter = filter;
    
    // if (event) {
        var exam = event.target.getAttribute('data-exam');
        var filter = event.target.value;
        
        allFilters[exam].usage = filter;

        setLocalStorageItem('allFilters', allFilters);
    // }

    exam = exam.replace('cm-', '');

    if (filter == 'none') {
        disableGroup('#version-'+exam+'-group');
        disableGroup('#area-'+exam+'-group');
    }
    if (filter == 'version') {
        enableGroup('#version-'+exam+'-group');
        disableGroup('#area-'+exam+'-group');
    }
    if (filter == 'area') {
        disableGroup('#version-'+exam+'-group');
        enableGroup('#area-'+exam+'-group');
    }
    if (filter == 'both') {
        // enableGroup('#version-'+exam+'-group');
        // enableGroup('#area-'+exam+'-group');
    }
}

function enableGroup(name) {
    // group
    document.querySelector(name).style.opacity = '1';
    // trigger
    document.querySelector(name + '-tgr').setAttribute('data-disabled', 'false');
    // filters
    var elements = document.querySelectorAll(name + ' .custom-control-input');
    for (var el in elements) {
        if (elements[el].type == 'checkbox') {
            elements[el].disabled = false;
        }
    }
}

function disableGroup(name) {
    // group
    document.querySelector(name).style.opacity = '.1';
    // trigger
    document.querySelector(name + '-tgr').setAttribute('data-disabled', 'true');
    // filters
    var elements = document.querySelectorAll(name + ' .custom-control-input');
    for (var el in elements) {
        if (elements[el].type == 'checkbox') {
            elements[el].disabled = true;
        }
    }
}

function defaultFilters(config) {
    console.log('default filters used');
    var exam = 'cm-' + config.exam;
    if (!allFilters[exam]) {
        console.warn('no object for ' + exam);
        allFilters[exam] = {};
    }
    if (!allFilters[exam].hasOwnProperty('filters')) {
        console.warn('no filters for ' + exam);
        console.log(allFilters[exam]);
        console.log(allFilters[exam].filters);
        allFilters[exam].setup = 'default';
        allFilters[exam].usage = 'none';
        allFilters[exam].filters = {'version': {}, 'area': {}};
        for (var ver in config.version) {
            allFilters[exam].filters.version[ver] = true;
        }
        for (var tag in config.area) {
            allFilters[exam].filters.area[tag] = true;
        }
    }
    setLocalStorageItem('allFilters', allFilters);
}

// Handle filtering exam from list
function toggleFilters(event) {
    console.log('toggleFilters() has been used.');
    
    console.log(event.target.getAttribute('data-disabled'));
    console.log(event.target.getAttribute('data-disabled') == 'true');
    if (event.target.getAttribute('data-disabled') == 'true') {
        return;
    }
    var filter = event.target.getAttribute('id');
    var type = filter.split('-')[0];
    var selected = event.target.getAttribute('data-selected') || 'true';
    var elements = document.querySelectorAll('#' + filter.replace('-tgr', '') + ' .custom-control-input');

    for (var el in elements) {
        if (elements[el].type == 'checkbox') {
            if (selected == 'true') {
                elements[el].checked = false;
                event.target.setAttribute('data-selected', 'false');
                event.target.textContent = getMessage('select_filters', 'select all');
                allFilters[exam].filters[type][elements[el].value] = false;
            } else {
                elements[el].checked = true;
                event.target.setAttribute('data-selected', 'true');
                event.target.textContent = getMessage('unselect_filters', 'unselect all');
                allFilters[exam].filters[type][elements[el].value] = true;
            }
        }
    }

    setLocalStorageItem('allFilters', allFilters);

    event.stopPropagation();

    state = 'exam_filtered';
}

// Handle filtering exam from list
function filterExam(event) {
    console.log('filterExam() has been used.');
    
    var value = event.target.value;
    var filter = event.target.getAttribute('data-filter');

    if (allFilters[exam].hasOwnProperty('filters')) {
        console.log('filter setup');
        allFilters[exam].filters.setup = 'custom';
        allFilters[exam].filters[filter][value] = event.target.checked;
        // console.log(allFilters[exam].filters.setup);
        // console.log(allFilters[exam].filters.version);
        // console.log(allFilters[exam].filters.area);
    }
    // if ('localStorage' in window) {
    //     localStorage.setItem('allFilters', JSON.stringify(allFilters));
        setLocalStorageItem('allFilters', allFilters);
    //     console.log('stored allFilters in localsotriage');
    // }

    event.stopPropagation();

    state = 'exam_filtered';
}

// Handle deleting exam from list
function deleteExam(event) {
    console.log('deleteExam() has been used.');
    
    // maybe confirmation
    var exam = event.target.getAttribute('data-exam').replace('heading-', '');

    $('#'+event.target.getAttribute('data-exam')).fadeOut(1000, function() {
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
    exam = 'cm-' + node.getAttribute('id').replace('heading-', '');

    // console.log(exam);
    // console.log(localStorage.getItem(exam));
    // console.warn(questions.all.map(x => x.index));
    // if (questions.all.length == 0) {
        parseChallenge(localStorage.getItem(exam));
    // }
    // console.warn(questions.all.map(x => x.index));

    // if (!allFilters[exam]) {
    //     allFilters[exam] = {};
    // }
    // if (!allFilters[exam].hasOwnProperty('filters')) {
    //     console.warn('no filters');
    //     console.log(allFilters[exam]);
    //     console.log(allFilters[exam].filters);
    //     allFilters[exam].filters = {'setup': 'default', 'version': {}, 'area': {}};
    //     for (var ver in allFilters[exam].version) {
    //         allFilters[exam].filters.version[ver] = true;
    //     }
    //     for (var tag in allFilters[exam].area) {
    //         allFilters[exam].filters.area[tag] = true;
    //     }
    // }
    console.log(allFilters[exam].filters);

    if ('localStorage' in window) {
        // if (!localStorage.getItem(exam)) {
            // localStorage.setItem(exam, content);
        // }
        localStorage.setItem('allFilters', JSON.stringify(allFilters));
    }

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
// Handle reading exam from file system
function loadQuestions() {
    // var spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';
    // $(this).prepend(spinner);

    document.querySelector('#file-input').click();

    // var promise = new Promise(function(resolve, reject) {

    // });
}

function readSingleFile(e) {
    // clear messages if any
    if ($('.loading-messages').length) {
        renderElement('.loading-messages', '');
    }
    var spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';
    $('#load').prepend(spinner);

    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        parseChallenge(e.target.result);

        var html = '<hr>';
        if (parser.errors.length) {
            for (var error of parser.errors) {
                html += info(error);
            }
        } else {
            html += info(getMessage('msg_exam_loaded_parsed', 'Exam file has been loaded and parsed sucessfully'));
        }
        renderElement('.loading-messages', html);

        $('#load').children('.spinner-border').remove();       

        if (['challenge_started', 'challenge_finished', 'exam_result_rendered', 'exam_printed'].includes(state)) {
            renderExams(false);
        } else {
            renderExams();
        }
    
        if (properties['app_ui_start_challenge_after_load_success']) {
            document.querySelector('#options-tgr').click();
            startChallenge();
        }
    };
    reader.readAsText(file);
}


// Handle retriving questions from server
function retrieveQuestions() {
    var spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';
    $(this).prepend(spinner);
    var code = document.getElementById('retrieve-code');
    var html = '';

    // clear messages if any
    if ($('.downloading-messages').length) {
        renderElement('.downloading-messages', '');
    }
    
    if (code.value == '') {
        html += error(getMessage('msg_exam_empty_code', 'Empty code.'));
        renderElement('.downloading-messages', html);
    } else {
        var req = new XMLHttpRequest();
        req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        try {
            req.send('code=' + code.value);

            if (req.status == 200) {
                if (req.responseText == 'Not found.') {
                    html += error(getMessage('msg_exam_invalid_code', 'Invalid code.'));
                } else {
                    html += info(getMessage('msg_exam_downloaded_parsed', 'Exam file has been downloaded and parsed sucessfully'));
                
                    parseChallenge(req.responseText);
    
                    console.log(allExams);
                    console.log(allExams[exam]);
                    if (code.value.length != 40) {
                        var examHash = {
                            'id': exam,
                            'generated': allExams[exam].generated,
                            'generatedDate': (new Date(allExams[exam].generated*1)) + '',
                            'hashcode': sha1(code.value)
                        };
                        examsHashes[exam] = examHash;
    
                        console.log(examsHashes);
                        setLocalStorageItem('examsHashes', examsHashes);
                    }
    
                    if (['challenge_started', 'challenge_finished', 'exam_result_rendered', 'exam_printed'].includes(state)) {
                        renderExams(false);
                    } else {
                        renderExams();
                    }
                    
                    code.value = '';
    
                    if (properties['app_ui_start_challenge_after_download_success']) {
                        document.querySelector('#options-tgr').click();
                        startChallenge();
                    }
                }
            } else {
                html += warning(req.status);
            }
        } catch (exception) {
            if (exception.name == 'NetworkError') {
                console.log('There was a network error.');
                html += error(exception.message);
            }
        }
        renderElement('.downloading-messages', html);
    }
    $(this).children('.spinner-border').remove();
}

// Handle checking fresh questions from server
function checkQuestions(exam) {
    var req = new XMLHttpRequest();

    req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false); 
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    try {
        req.send('hash=' + exam.hashcode);

        html = '';
        console.log(req);
        if (req.status == 200) {
            var timestamp = req.responseText * 1;

            if (exam.generated < timestamp) {
                html += '<i class="icon sync-icon" data-hash="'+exam.hashcode+'"></i>';
        
                $('#'+exam.id.replace('cm-', '')+' div h5').append(html);

                document.querySelector('#'+exam.id.replace('cm-', '')+' div h5 i').addEventListener('click', syncExam);
            }
        } else {
            html += warning(req.status);
        }
    } catch (exception) {
        if (exception.name == 'NetworkError') {
            console.log('There was a network error.');
            // html += warning(exception.message);
        }
    }
}

// Handle checking fresh questions from server
function syncExam(event) {
    console.log('syncExam() has been used.');

    // maybe confirmation
    var hash = event.target.getAttribute('data-hash');

    var req = new XMLHttpRequest();

    req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false); 
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    try {
        req.send('code=' + hash);

        if (req.status == 200) {
            parseChallenge(req.responseText);

            console.log(allExams[exam]);
            var examHash = {
                'id': exam,
                'generated': allExams[exam].generated,
                'generatedDate': (new Date(allExams[exam].generated)*1) + '',
                'hashcode': hash
            };
            examsHashes[exam] = examHash;
            setLocalStorageItem('examsHashes', examsHashes);
            
            $('#'+exam.replace('cm-', '')).html(prepareExam(allExams[exam], false));
            console.log('OK');
        } else {
            console.log(req.status);
        }
    } catch (exception) {
        if (exception.name == 'NetworkError') {
            console.log('There was a network error.');
            // html += warning(exception.message);
        }
    }
    event.stopPropagation();
}

// Handle shuffling array
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
  
    return array;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(st) {
    st = st.toLowerCase();
    st = st.replace(/[\u00C0-\u00C5]/ig,'a')
    st = st.replace(/[\u00C8-\u00CB]/ig,'e')
    st = st.replace(/[\u00CC-\u00CF]/ig,'i')
    st = st.replace(/[\u00D2-\u00D6]/ig,'o')
    st = st.replace(/[\u00D9-\u00DC]/ig,'u')
    st = st.replace(/[\u00D1]/ig,'n')
    st = st.replace(/[^a-z0-9 ]+/gi,'')
    st = st.trim().replace(/ /g,'-');
    st = st.replace(/[\-]{2}/g,'');
    return (st.replace(/[^a-z0-9\- ]*/gi,''));
}

function toggleElement(name) {
    var el = document.getElementById(name);
    if (el.className.indexOf('hidden') != -1) {
        el.className = el.className.replace('hidden', 'visible');
    } else {
        el.className = el.className.replace('visible', 'hidden');
    }
}

function showElement(name) {
    // var el = document.querySelector(name);
    // el.className = el.className.replace('hidden', 'visible');
    $(name).show();
}

function hideElement(name) {
    // var el = document.querySelector(name);
    // el.className = el.className.replace('visible', 'hidden');
    $(name).hide();
}

function enableAction(name) {
    var el = document.querySelector('#'+name+'-button');
    if (el.className.indexOf('disabled') == -1) {
        return;
    }
    console.log('Action ['+name+'] has been enabled.');
    el.className = el.className.replace('disabled', 'enabled');
}

function disableAction(name) {
    var el = document.querySelector('#'+name+'-button');
    if (el.className.indexOf('enabled') == -1) {
        return;
    }
    console.log('Action ['+name+'] has been disabled.');
    el.className = el.className.replace('enabled', 'disabled');
}

function triggerAction(name) {
    document.querySelector(name+'-name').click();
}

function renderElement(name, html) {
    document.querySelector(name).innerHTML = html;
}

function enableKeyEvents() {
    keyEventEnabled = true;
}

function disableKeyEvents() {
    keyEventEnabled = false;
}

// Handle skiping intro
function skipIntro() {
    hideElement('#splash');
    showElement('#exams');
    showElement('#menu');
    renderExams();
}

// Handle splash screen
function runIntro() {
    showElement('#splash');
    setTimeout(function() {
        hideElement('#splash');
        showElement('#exams');
        showElement('#menu');
        renderExams();
    }, 3000);
}

// Internal function for counting current progress
function countProgress() {
    console.warn('answered');
    var answered = answeredExamQuestions();
    var current = answered.length / questions.used.length * 100;
    if (current === 100) {
        enableAction('stop');
    }
    renderProgress(current);
}

// Internal function to render current progress value
function renderProgress(value) {
    if (properties['app_ui_display_progress']) {
        document.querySelector('.progress div').style = 'width: ' + value + '%;';
    }
}

// Internal function returning anwered questions
function answeredExamQuestions() {
    return questions.exam.filter(function(elem, index, array) { return typeof elem != 'undefined' && elem != null; });
}

// Internal function returning anwered questions
function changeLanguage(language) {
    console.log('change language');

    // var language = this.value || language;

    // renderProperties(propertiesSetup);
}

// Internal function returning anwered questions
function changeTheme(theme) {
    console.log('change theme');
    // console.log(this);

    var theme = this.value || theme;
    document.querySelectorAll('link[rel=stylesheet]').forEach(function(itm, i) {
        if (!itm.hasAttribute('disabled')) {
            itm.setAttribute('disabled', true);
        }
    });

    document.querySelector('link[href*=bootstrap]').removeAttribute('disabled');
    document.querySelector('link[href*=main]').removeAttribute('disabled');

    if (theme == 'light') {
        document.querySelectorAll('link[href*=light]').forEach(function(itm, i) {
            itm.removeAttribute('disabled');
        });
    }

    if (theme == 'dark') {
        document.querySelectorAll('link[href*=dark]').forEach(function(itm, i) {
            itm.removeAttribute('disabled');
        });
    }

    if (theme == 'gold') {
        document.querySelectorAll('link[href*=gold]').forEach(function(itm, i) {
            itm.removeAttribute('disabled');
        });
    }
}

// Internal function returning anwered questions
function changeAnnotations(annotations) {
    console.log('change annotations');

    var annotations = this.value || annotations;

    var items = document.querySelectorAll('.alert-info');
    if (annotations) {
        items.forEach(function(itm) {
            console.log(itm);
            $(itm).show();
        });
    } else {
        items.forEach(function(itm) {
            $(itm).hide();
        });
    }

    // renderProperties(propertiesSetup);
}

function prepareMessage(type, message, params) {
    // TODO params in messages
    return '<div class="alert alert-'+type+' mb-2" role="'+type+'">' + message + '</div>';
}

function info(message, params) {
    return prepareMessage('info', message, params);
}

function warning(message, params) {
    return prepareMessage('warning', message, params);
}

function error(message, params) {
    return prepareMessage('danger', message, params);
}

function renderErrors(question, returnHtml = false) {
    var html = '';
    if (errors[question]) {
        for (var e of errors[question]) {
            html += error(e);
        }
    }
    if (returnHtml) {
        return html;
    }
    renderElement('.question-errors', html);
}

function showFeedback(type) {
    console.log('showFeedback() has been used.');

    if (properties.quiz_answer_instant_feedback) {
        var feedback = document.querySelector('.feedback.'+type);

        if (properties.quiz_positive_feedback_audio && type == 'good') {
            goodFeedback.play();
        }
        if (properties.quiz_negative_feedback_audio && type == 'bad') {
            badFeedback.play();
        }

        feedback.style.display = 'flex';

        setTimeout(function() {
            feedback.style.display = 'none';
        }, 500);
    }
}

function runSpinner(callback, toShow) {
    hideElements();
    showElement('#splash');
    
    // hideElement('.result');
    setTimeout(function() {
        hideElement('#splash');
        // showElement('#exams');
        showElement('#menu');
        if (callback in window) {
            window[callback]();
        }
    }, 3000);
}


function showElements(elements) {
    var defaults = ['splash', 'menu', 'exams', 'challenge', 'result', 'progress', 'timer'];

    if (elements == undefined) {
        elements = defaults;
    }
    for (var el in elements) {
        $('#'+elements[el]).show();
        console.log('Showing [#'+elements[el]+'] element.');
    }
}

function hideElements(elements) {
    var defaults = ['splash', 'menu', 'exams', 'challenge', 'result', 'progress', 'timer'];

    if (elements == undefined) {
        elements = defaults;
    }
    for (var el in elements) {
        $('#'+elements[el]).hide();
        console.log('Hidding [#'+elements[el]+'] element.');
    }
}

function getLocalStorageItem(item, parse = true) {
    if ('localStorage' in window) {
        if (item in localStorage) {
            var value = localStorage.getItem(item);
            value = parse ? JSON.parse(value) : value;
            console.log('Value has been get from localStorage['+item+'] item.');
            return value;
        }
    }
}

function setLocalStorageItem(item, value, stringify = true) {
    if ('localStorage' in window) {
        value = stringify ? JSON.stringify(value) : value;
        localStorage.setItem(item, value);
        console.log('Value has been set in localStorage['+item+'] item.');
    }
}

function removeLocalStorageItem(item) {
    if ('localStorage' in window) {
        if (item in localStorage) {
            localStorage.removeItem(item);
            console.log('localStorage['+item+'] item has been removed.');
        }
    }
}

function checkAppVersion() {
    // if ('localStorage' in window) {
        // var current;
        // if ('learnwise' in localStorage) {
            // console.log(getLocalStorageItem('learnwise', false));
            // console.log(LW_VERSION);
        if (getLocalStorageItem('learnwise', false) == LW_VERSION) {
            $('#version strong')[0].textContent = LW_VERSION;
        } else {
            var html = warning(getMessage('msg_new_version', 'Application available online has new features. Your local version is outdated. Reset all settings using button placed below.'));
            renderElement('.version-messages', html);
        }
    // }
}

function renderMessage(message, type, element, autoclose = false) {
    var type = type || 'alert';
    var template = error(message);
    
    document.querySelector(element).innerHTML = template;
    if (autoclose) {
        setTimeout(function() {
            $(element).children('div').fadeOut().remove();
        }, 3000);
    }
}

function replaceBBCode(text) {
    text = text.split('[dash]').join('&ndash;');
    text = text.split('[tab]').join('&nbsp;&nbsp;&nbsp;&nbsp;');
    return text;
}


(function(){
    "use strict";
  
    function escapeHtml() {
      return this.replace(/[&<>"'\/]/g, function (s) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
          };
  
        return entityMap[s];
      });
    }
  
    if (typeof(String.prototype.escapeHtml) !== 'function') {
      String.prototype.escapeHtml = escapeHtml;
    }
})();


function getTime() {
    if (properties['quiz_questions_use_all']) {
        duration = questions.used.length * 120
    } else {
        duration = allExams[exam].duration * 60
    }
    return duration;
}

function generateMenuSections() {
    if ('content' in document.createElement('template')) {
        var menu = document.querySelector('.menu-options .container');
        var section = document.querySelector('#menu-section');
        var item = document.querySelector('#menu-item');

        var about = section.content.cloneNode(true);
        var aboutHeader = about.querySelector('p');
        aboutHeader.textContent = getMessage('about_app', 'About');
        var aboutContent = about.querySelector('div');

        var version = item.content.cloneNode(true);
        var sourceCode = item.content.cloneNode(true);
        var defaultSettings = item.content.cloneNode(true);
        
        version.querySelector('div').innerHTML = '<span>' + getMessage('version_desc') + ': <strong data-version=""></strong></span><div class="version-messages"></div>';
        // console.log(version);
        version.querySelector('div').id = 'version';
        // version.setAttribute('id', 'version');
        
        var sourceCodeLink = ['<a href="https://github.com/lukasz-jakub-adamczuk/codemarker#codemarker">${}</a>'];
        
        sourceCode.querySelector('div').innerHTML = '<span>' + getMessage('source_code_desc', 'Source code available on ${Github}', sourceCodeLink) + '</span>';
        defaultSettings.querySelector('div').innerHTML = '<span>' + getMessage('default_settings_desc', 'Use those actions to back with current options to default settings.') + '</span><div class="mb-2"><button id="default-settings" class="btn btn-secondary">' + getMessage('reset_settings', 'Reset settings') + '</button> <button id="enable-new-features" class="btn btn-secondary">' + getMessage('enable_new_features', 'Enable new features') + '</button> <button id="remove-exams" class="btn btn-danger">' + getMessage('remove_exams', 'Remove exams') + '</button></div><div class="settings-messages"></div>';

        aboutContent.appendChild(version);
        aboutContent.appendChild(sourceCode);
        aboutContent.appendChild(defaultSettings);
        
        menu.appendChild(about);


        var upload = document.querySelector('#upload-section');
        var uploadSection = upload.content.cloneNode(true);

        var uploadHeader = uploadSection.querySelector('p');
        var uploadDescription = uploadSection.querySelector('span');
        var uploadButton = uploadSection.querySelector('#load');

        var fileFormatLink = ['<a href="https://github.com/lukasz-jakub-adamczuk/codemarker#file-format">${}</a>'];
        
        uploadHeader.textContent = getMessage('upload_file', 'Upload file');
        uploadDescription.innerHTML = getMessage('upload_desc', 'Use this option to load questions from your computer or mobile. File content must be in special ${format} to be parsed with application.', fileFormatLink);
        uploadButton.textContent = getMessage('load_questions', 'Load your questions');

        menu.appendChild(uploadSection);


        var retrieve = document.querySelector('#retrieve-section');
        var retrieveSection = retrieve.content.cloneNode(true);

        var retrieveHeader = retrieveSection.querySelector('p');
        var retrieveDescription = retrieveSection.querySelector('span');
        var retrievePlaceholder = retrieveSection.querySelector('#retrieve-code');
        var retrieveButton = retrieveSection.querySelector('#retrieve');

        retrieveHeader.textContent = getMessage('retrieve_file', 'Retrieve file from internet');
        retrieveDescription.textContent = getMessage('retrieve_desc', 'Retrieve file from internet');
        retrievePlaceholder.placeholder = getMessage('retrieve_placeholder', 'type code here');
        retrieveButton.textContent = getMessage('retrieve_questions', 'Retrieve');

        menu.appendChild(retrieveSection);


        var propertiesSection = document.createElement('div')
        propertiesSection.id = 'app-properties';
        // <div id="app-properties"></div>
        menu.appendChild(propertiesSection);
        
    }
}

// function generateRetrieveSection() {
//     var menu = document.querySelector('.menu-options .container');
//     var div = document.createElement('div');

//     var retrieveHeader = getMessage('retrieve_file', 'Retrieve file from internet');
//     var retrieveDesciption = getMessage('retrieve_desc', 'Use this option to load prepared questions from LearnWise cloud storage.');
//     var retrievePlaceholder = getMessage('retrieve_questions', 'Retrieve');
//     var retrieveButton = getMessage('retrieve_placeholder', 'type code here');
    
//     var html = '';
//     html =+ '<p class="opts-header">' + retrieveHeader + '</p>';
//     html =+ '    <div class="list-group">';
//     html =+ '        <div class="list-group-item list-group-item-action flex-column align-items-start">';
//     html =+ '            <span>' + retrieveDesciption + '</span>';
//     html =+ '            <div class="input-group mb-2">';
//     html =+ '                <input id="retrieve-code" type="text" class="form-control" placeholder="' + retrievePlaceholder + '" aria-label="' + retrievePlaceholder + '" aria-describedby="retrieve">';
//     html =+ '                <div class="input-group-append">';
//     html =+ '                    <button id="retrieve" class="btn btn-primary" type="button">' + retrieveButton + '</button>';
//     html =+ '                </div>';
//     html =+ '            </div>';
//     html =+ '            <div class="downloading-messages"></div>';
//     html =+ '        </div>';
//     html =+ '    </div>';

//     div.innerHTML = html;

//     menu.appendChild(div.firstElementChild);

    
// }
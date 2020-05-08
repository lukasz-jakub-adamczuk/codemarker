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
                html += '<div class="alert alert-warning mb-2" role="alert">' + error + '</div>';
            }
        } else {
            html += '<div class="alert alert-info mb-2" role="info">Exam file has been loaded and parsed sucessfully.</div>';
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
        html += '<div class="alert alert-danger mb-2" role="alert">Empty code.</div>';
        renderElement('.downloading-messages', html);
    } else {
        var req = new XMLHttpRequest();
        req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false); 
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        try {
            req.send('code=' + code.value);

            if (req.status == 200) {
                if (req.responseText == 'Not found.') {
                    html += '<div class="alert alert-danger mb-2" role="alert">Invalid code.</div>';
                } else {
                    html += '<div class="alert alert-info mb-2" role="info">Exam file has been downloaded and parsed sucessfully.</div>';
                
                    parseChallenge(req.responseText);
    
                    // console.log(allExams[exam]);
                    if (code.value.length != 40) {
                        var examHash = {
                            'id': exam,
                            'generated': allExams[exam].generated,
                            'generatedDate': (new Date(allExams[exam].generated*1)) + '',
                            'hashcode': sha1(code.value)
                        };
                        examsHashes[exam] = examHash;
    
                        // console.log(examsHashes);
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
                html += '<div class="alert alert-warning mb-2" role="alert">' + req.status + '</div>';
            }
        } catch (exception) {
            if (exception.name == 'NetworkError') {
                console.log('There was a network error.');
                html += '<div class="alert alert-danger mb-2" role="alert">' + exception.message + '</div>';
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
            html += '<div class="alert alert-warning mb-2" role="alert">' + req.status + '</div>';
        }
    } catch (exception) {
        if (exception.name == 'NetworkError') {
            console.log('There was a network error.');
            // html += '<div class="alert alert-warning mb-2" role="alert">' + exception.message + '</div>';
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
            // html += '<div class="alert alert-warning mb-2" role="alert">' + exception.message + '</div>';
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
        document.querySelector('.progresso span').style = 'width: ' + value + '%;';
    }
}

// Internal function returning anwered questions
function answeredExamQuestions() {
    return questions.exam.filter(function(elem, index, array) { return typeof elem != 'undefined';})
}

function renderErrors(question, returnHtml = false) {
    var html = '';
    if (errors[question]) {
        for (var error of errors[question]) {
            html += '<div class="alert alert-danger mb-2" role="alert">'+error+'</div>';
        }
    }
    if (returnHtml) {
        return html;
    }
    renderElement('.question-errors', html);
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
    if ('localStorage' in window) {
        if ('learnwise' in localStorage) {
            if (getLocalStorageItem('learnwise', false) == LW_VERSION) {
                $('#version strong')[0].textContent = LW_VERSION;
            }
        } else {
            var html = '<div class="alert alert-warning mb-2" role="alert">Application available online has new features. Your local version is outdated. Reset all settings using button placed below.</div>';
            renderElement('.version-messages', html);
        }
    }
}

function renderMessage(message, type, element, autoclose = false) {
    var type = type || 'alert';
    var template = '<div class="alert alert-'+type+' mb-2" role="alert">'+message+'</div>'
    
    document.querySelector(element).innerHTML = template;
    if (autoclose) {
        setTimeout(function() {
            $(element).children('div').fadeOut().remove();
        }, 3000);
    }
}


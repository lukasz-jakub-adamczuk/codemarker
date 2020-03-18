// Handle reading exam from file system
function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        parseChallenge(e.target.result);

        //render potencial errors
        if (parser.errors.length) {
            var html = '<hr>';
            for (var error of parser.errors) {
                html += '<div class="alert alert-warning" role="alert">' + error + '</div>';
            }
            renderElement('.loading-errors', html);
        }

        renderExams();
    
        if (properties['app.ui.start_challenge_after_load_success']) {
            document.querySelector('#options-tgr').click();
            startChallenge();
        }
    };
    reader.readAsText(file);
}

// Handle retriving questions from server
function retrieveQuestions() {
    var code = document.getElementById('retrieve-code').value;
    var req = new XMLHttpRequest();

    req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false); 
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send('code=' + code);

    if (req.status == 200) {
        parseChallenge(req.responseText);
    }
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

function reorderArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i].index = i+1;
        // array[i].processed = true;
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

function toggleElement(element) {
    var el = document.getElementById(element);
    if (el.className.indexOf('hidden') != -1) {
        el.className = el.className.replace('hidden', 'visible');
    } else {
        el.className = el.className.replace('visible', 'hidden');
    }
}

function showElement(element) {
    var el = document.getElementById(element);
    el.className = el.className.replace('hidden', 'visible');
}

function hideElement(element) {
    var el = document.getElementById(element);
    el.className = el.className.replace('visible', 'hidden');
}

function enableAction(name) {
    var el = document.getElementById(name+'-button');
    if (el.className.indexOf('disabled') == -1) {
        return;
    }
    console.log('Action ['+name+'] has been enabled.');
    el.className = el.className.replace('disabled', 'enabled');
}

function disableAction(name) {
    var el = document.getElementById(name+'-button');
    if (el.className.indexOf('enabled') == -1) {
        return;
    }
    console.log('Action ['+name+'] has been disabled.');
    el.className = el.className.replace('enabled', 'disabled');
}

function triggerAction(name) {
    document.getElementById(name+'-button').click();
}

function renderElement(name, html) {
    document.querySelector(name).innerHTML = html;
}

// Handle skiping intro
function skipIntro() {
    hideElement('splash');
    showElement('exams');
    showElement('menu');
    renderExams();
}

// Handle splash screen
function runIntro() {
    showElement('splash');
    setTimeout(function() {
        hideElement('splash');
        showElement('exams');
        showElement('menu');
        renderExams();
    }, 3000);
}

// Internal function for counting current progress
function countProgress() {
    var answered = answeredExamQuestions();
    var current = answered.length / allExams[exam].questions * 100;
    if (current === 100) {
        enableAction('stop');
    }
    renderProgress(current);
}

// Internal function to render current progress value
function renderProgress(value) {
    if (properties['app.ui.display_progress']) {
        document.querySelector('.progresso span').style = 'width: ' + value + '%;';
    }
}

// Internal function returning anwered questions
function answeredExamQuestions() {
    return questions.exam.filter(function(elem, index, array) { return typeof elem != 'undefined';})
}
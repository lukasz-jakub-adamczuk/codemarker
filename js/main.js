'use script';

// hide menu by default (in case would be opened during page reload and intro running)
$('#options-tgr').prop('checked', false);

// show menu from app if needed
// $('#options-tgr').click();

// generate menu sections
generateMenuSections();

// init properties with default values
// initProperties(propertiesSetup);

// load user preferences from localStorage
if ('localStorage' in window) {
    // properties version
    // if ('learnwise' in localStorage) {
    //     document.querySelector('#version strong').textContent = localStorage.getItem('learnwise');
    // } else {
    //     document.querySelector('#version strong').textContent = '0.07';
    // }
    
    // properties
    // if (localStorage.getItem('properties')) {
    //     properties = JSON.parse(localStorage.getItem('properties'));
    // }
    // available exams
    if ('allExams' in localStorage) {
        allExams = JSON.parse(localStorage.getItem('allExams'));
    }
    if ('allFilters' in localStorage) {
        allFilters = JSON.parse(localStorage.getItem('allFilters'));
    }
    // hashes for exams retrived from server
    if ('examsHashes' in localStorage) {
        examsHashes = JSON.parse(localStorage.getItem('examsHashes'));
    }
}

if ('localStorage' in window) {
    version = getLocalStorageItem('learnwise', false);
} else {
    version = PROP_VERSION;
}
document.querySelector('#version strong').textContent = version;

// this code assigns crap to vars
// available exams
// allExams = getLocalStorageItem('allExams');

// hashes for exams retrived from server
// examsHashes = getLocalStorageItem('examsHashes');

if (properties['app_ui_introduction_enabled']) {
    runSpinner('renderExams');
} else {
    skipIntro();
}

if (properties['app_ui_theme']) {
    changeTheme(properties['app_ui_theme']);
}

// renderProperties(propertiesSetup);

// checking online version with local
checkAppVersion();

// generateRetrieveSection();

// setTimeout(function() {
    if (getLocalStorageItem('examStorage')) {
        restoreExam();
    }
// }, 3000);


// adding events
bindMenuEvents();

// challenge
document.querySelector('#exams .list').addEventListener('click', selectExam, true);  // true
// document.querySelector('.challenge').addEventListener('click', registerAnswerForSimpleQuestion);
document.querySelector('.challenge').addEventListener('change', registerAnswerForSimpleQuestion);

document.querySelector('#start-button').addEventListener('click', startChallenge);
document.querySelector('#stop-button').addEventListener('click', stopChallenge);
document.querySelector('#stop-button').addEventListener('dblclick', stopChallenge);
document.querySelector('#print-button').addEventListener('click', printExam);

document.querySelector('#prev-button').addEventListener('click', prevQuestion);
document.querySelector('#next-button').addEventListener('click', nextQuestion);
document.querySelector('#answers-button').addEventListener('click', showCorrectAnswers);

var keys = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'esc': 27,
    'help': 72,
    'tab': 9,
    'w': 87,
    'a': 65,
    's': 83,
    'd': 68,
    'c': 67,
    'r': 82
};

window.addEventListener('keydown', function(event) {
    if ($('body').hasClass('modal-open')) {
        keyEventEnabled = false;
    } else {
        keyEventEnabled = true;
    }
    console.log(event.keyCode + ' pressed.');
    if (keyEventEnabled) {
        switch (event.keyCode) {
            case keys.left:
            case keys.a:
                prevQuestion(event);
                break;
            case keys.right:
            case keys.d:
                nextQuestion(event);
                break;
            case keys.top:
                // prevQuestion(event);
                break;
            case keys.down:
                // nextQuestion(event);
                break;
            case keys.esc:
                // nextQuestion(event);
                break;
            case keys.help:
            case keys.s:
                showCorrectAnswers();
                break;
            case keys.c:
                completeCorrectAnswers();
                break;
            case keys.r:
                var reviewTgr = document.querySelector('.review-question');
                if (reviewTgr) {
                    reviewTgr.click();
                }
                break;
            // case keys.tab:
            //     break;
        }
    }
});

// translations
document.querySelectorAll('.modal-footer button').forEach(function(itm, idx) {
    itm.textContent = getMessage('close', 'Close');
});

document.querySelector('#comment-modal-label').textContent = getMessage('comment', 'Comment');
document.querySelector('#image-modal-label').textContent = getMessage('image', 'Image');
document.querySelector('#database-modal-label').textContent = getMessage('info', 'About question');

var challengeLayer = document.getElementById('#challenge');

// var hammertime = new Hammer(document.getElementById('#challenge'), {});
// var mc = new Hammer(challengeLayer);

// // listen to events...
// mc.on("panleft panright tap press", function(ev) {
//     challengeLayer.textContent = ev.type +" gesture detected.";
// });
// hammertime.on('panleft', function(ev) {
//     console.log(ev);
//     prevQuestion();
// });
// hammertime.on('panright', function(ev) {
//     console.log(ev);
//     nextQuestion();
// });


// var myElement = document.getElementById('myElement');
var myElement = document.querySelector('body');

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

// listen to events...
// mc.on("panleft panright tap press", function(ev) {
//     myElement.textContent = ev.type +" gesture detected.";
// });
mc.on("swipeleft", function(ev) {
    console.log(ev.type);
    // prevQuestion();
    nextQuestion(ev);
});
mc.on("swiperight", function(ev) {
    console.log(ev.type);
    // nextQuestion();
    prevQuestion(ev);
});

displayTimerElement = document.querySelector('.timer-content');

function renderTimer() {
    if (properties['app_ui_display_timer']) {
        var hours   = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours*3600)) / 60);
        var seconds = Math.floor(time - (hours*3600) - (minutes*60));
        var timer = (hours+'').padStart(2, '0') + ':' + (minutes+'').padStart(2, '0') + ':' + (seconds+'').padStart(2, '0');
        displayTimerElement.textContent = timer;
        // console.log(time);
    }
}




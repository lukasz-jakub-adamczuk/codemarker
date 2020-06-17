'use strict';

const LW_VERSION = 'v0.07 patch-1';

var codeMarker = {};

var state;

var questions = {
    'all': [],
    'used': [],
    'exam': [],
    'ignored': [],
    'marked': [],
    'answered': []
};
var challenge;
var limit;
var displayTimer;
var saverTimer;

var keyEventEnabled = false;

// var initialSetup = {};
var allExams = {};
var examsHashes = {};
var availableExams = [];

var errors = [];

var exam;
var time;

var stats;
    var mapping = {};

var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

// hide menu by default (in case would be opened during page reload and intro running)
$('#options-tgr').prop('checked', false);

// checking online version with local
checkAppVersion();

// init properties with default values
initProperties(propertiesSetup);

// load user preferences from localStorage
if ('localStorage' in window) {
    // properties
    if (localStorage.getItem('properties')) {
        properties = JSON.parse(localStorage.getItem('properties'));
    }
    // available exams
    if ('allExams' in localStorage) {
        allExams = JSON.parse(localStorage.getItem('allExams'));
    }
    // hashes for exams retrived from server
    if ('examsHashes' in localStorage) {
        examsHashes = JSON.parse(localStorage.getItem('examsHashes'));
    }
}

if (properties['app_ui_introduction_enabled']) {
    runSpinner('renderExams');
} else {
    skipIntro();
}



renderProperties(propertiesSetup);

// setTimeout(function() {
    if (getLocalStorageItem('examStorage')) {
        restoreExam();
    }
// }, 3000);


// adding events

// options
document.querySelector('#file-input').addEventListener('change', readSingleFile);
document.querySelector('#load').addEventListener('click', loadQuestions);
document.querySelector('#retrieve').addEventListener('click', retrieveQuestions);
document.querySelector('#app-properties').addEventListener('click', manageProperty);
document.querySelector('#default-settings').addEventListener('click', resetAllSettings);
document.querySelector('#remove-exams').addEventListener('click', removeAllExams);


// challenge
document.querySelector('#exams .list').addEventListener('click', selectExam);  // true
// document.querySelector('.challenge').addEventListener('click', registerAnswerForSimpleQuestion);
document.querySelector('.challenge').addEventListener('change', registerAnswerForSimpleQuestion);

document.querySelector('#start-button').addEventListener('click', startChallenge);
document.querySelector('#stop-button').addEventListener('click', finishChallenge);
document.querySelector('#print-button').addEventListener('click', printExam);

document.querySelector('#prev-button').addEventListener('click', prevQuestion);
document.querySelector('#next-button').addEventListener('click', nextQuestion);
document.querySelector('#answers-button').addEventListener('click', showCorrectAnswers);



var arrows = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};

window.addEventListener('keydown', function(event) {
    if ($('body').hasClass('modal-open')) {
        keyEventEnabled = false;
    } else {
        keyEventEnabled = true;
    }
    if (keyEventEnabled) {
        switch (event.keyCode) {
            case arrows.left:
                prevQuestion(event);
                break;
            case arrows.right:
                nextQuestion(event);
                break;
        }
    }
});

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

function renderTimer() {
    if (properties['app_ui_display_timer']) {
        var hours   = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours*3600)) / 60);
        var seconds = Math.floor(time - (hours*3600) - (minutes*60));
        var timer = (hours+'').padStart(2, '0') + ':' + (minutes+'').padStart(2, '0') + ':' + (seconds+'').padStart(2, '0');
        document.querySelector('.timer-content').innerHTML = timer;
        // console.log(time);
    }
}




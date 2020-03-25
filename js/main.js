'use strict';

var codeMarker = {};

var questions = {
    'all': [],
    'used': [],
    'exam': [],
    'ignored': []
};
var challenge;
var limit;
var displayTimer;

var keyEventEnabled = false;

// var initialSetup = {};
var allExams = {};

var errors = [];

var exam;
var time;

var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');


initProperties(propertiesSetup);
var availableExams = [];

if ('localStorage' in window) {
    // properties
    if (localStorage.getItem('properties')) {
        properties = JSON.parse(localStorage.getItem('properties'));
    }
    // exams
    
    // if ('initialSetup' in localStorage) {
    //     initialSetup = JSON.parse(localStorage.getItem('initialSetup'));
    // }
    if ('allExams' in localStorage) {
        allExams = JSON.parse(localStorage.getItem('allExams'));
    }
    // for (var prop in localStorage) {
    //     if (prop.substr(0, 2) == 'cm') {
    //         availableExams.push(prop);
    //     }
    // }
}

if (properties['app.ui.introduction_enabled']) {
    runIntro();
} else {
    skipIntro();
}



renderProperties(propertiesSetup);


// adding events

// options
document.querySelector('#file-input').addEventListener('change', readSingleFile, false);
document.querySelector('#load').addEventListener('click', function() { document.querySelector('#file-input').click(); }, false);
document.querySelector('#retrieve').addEventListener('click', retrieveQuestions, false);
document.querySelector('#app-properties').addEventListener('click', manageProperty, true);


// challenge
document.querySelector('#exams .list').addEventListener('click', selectExam, true);
document.querySelector('.challenge').addEventListener('click', registerAnswerForSimpleQuestion, false);
document.querySelector('.challenge').addEventListener('change', registerAnswerForMatchingQuestion, false);

document.querySelector('#start-button').addEventListener('click', startChallenge, false);
document.querySelector('#stop-button').addEventListener('click', finishChallenge, false);
document.querySelector('#print-button').addEventListener('click', printExam, false);

document.querySelector('#prev-button').addEventListener('click', prevQuestion, false);
document.querySelector('#next-button').addEventListener('click', nextQuestion, false);
document.querySelector('#answers-button').addEventListener('click', showCorrectAnswers, false);




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

// var hammertime = new Hammer(document.getElementById('body'), {});
// hammertime.on('swipeleft', function(ev) {
//     console.log(ev);
//     prevQuestion();
// });
// hammertime.on('swiperight', function(ev) {
//     console.log(ev);
//     nextQuestion();
// });

function renderTimer() {
    if (properties['app.ui.display_timer']) {
        var hours   = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours*3600)) / 60);
        var seconds = Math.floor(time - (hours*3600) - (minutes*60));
        var timer = (hours+'').padStart(2, '0') + ':' + (minutes+'').padStart(2, '0') + ':' + (seconds+'').padStart(2, '0');
        document.querySelector('.timer-content').innerHTML = timer;
        // console.log(time);
    }
}








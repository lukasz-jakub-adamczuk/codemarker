'use strict';


// Handle registring answer used to calculate running challenge result
function registerAnswer(event) {
    if (event.target.getAttribute('id')) {
        var label = event.target.getAttribute('id');

        var question = label.split('qstn-')[1].split('-answr-')[0];
        var answer = label.split('-answr-')[1];

        var type = questions['used'][question-1].params['type'];

        if (!(question in questions.exam)) {
            questions.exam[question] = {};
        }

        if (type == 'single') {
            questions.exam[question] = {};
            questions.exam[question][answer] = true;
        }
        if (type == 'multiple') {
            if (answer in questions.exam[question]) {
                questions.exam[question][answer] = !questions.exam[question][answer];
            } else {
                // first click in answer
                questions.exam[question][answer] = true;
            }
        }
        console.log('Registered answer:');
        console.log(questions.exam[question]);

        countProgress();

        if ((answeredExamQuestions().length) == allExams[exam].questions) {
            enableAction('stop');
        }
    }
}

// Handle showing correct answers on current question
function showCorrectAnswers() {
    for (var answer in questions.used[challenge].answers.choices) {
        if (questions.used[challenge].answers.choices[answer].type == 'wrong') {
            document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-wrong';
        } else {
            document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-correct';
        }
    }
}

// Handle mapping answers
function processAnswers(answers) {
    var result = {'correct': 0, 'wrong': 0, 'choices': [], 'processed': true, 'shuffled': false};
    var types = ['correct', 'wrong'];
    var answer;
    for (var type of types) {
        if (answers[type]) {
            for (var ans in answers[type]) {
                answer = {
                    'type': type,
                    'slug': ans,
                    'name': answers[type][ans]
                };
                result.choices.push(answer);
                result[type]++;
            }
        }
    }
    return result;
}

// Handle exam result calculations
function validateExamAnswers() {
    var score = 0;
    var point;
    var ratio;

    for (var i = 1; i < questions.exam.length; i++) {
        ratio = 1 / questions.used[i-1].answers.correct;
        point = 0;
        // summarize multiple checked answers
        for (var answer in questions.exam[i]) {
            if (questions.exam[i][answer] == true && questions.used[i-1].answers.choices[answer].type == 'correct') {
                point += ratio;
            }
        }
        // any incorrect answer wil
        if (ratio < 1) {
            if (answer in questions.exam[i] && questions.exam[i][answer] == true && questions.used[i-1].answers.choices[answer].type == 'wrong') {
                point = 0;
            }
        }
        score += point;
    }

    score = score * 100 / allExams[exam].questions;

    return Math.floor(score);
}

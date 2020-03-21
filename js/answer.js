'use strict';


// Handle registring answer used to calculate running challenge result
function registerAnswerForSimpleQuestion(event) {
    if (event.target.getAttribute('id')) {
        var label = event.target.getAttribute('id');
        var question = label.split('qstn-')[1].split('-answr-')[0];
        var answer = label.split('-answr-')[1];
        var type = questions['used'][question-1].params['type'];

        if (type == 'single' || type == 'multiple') {
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

            if ((answeredExamQuestions().length) == questions.used.length) {
                enableAction('#stop');
            }
        }
    }
}
// Handle registring answer used to calculate running challenge result
function registerAnswerForMatchingQuestion(event) {
    var label = event.target.getAttribute('id');
    var question = label.split('qstn-')[1].split('-answr-')[0];
    var answer = label.split('-answr-')[1];
    var type = questions['used'][question-1].params['type'];

    if (type == 'matching') {
        console.log('Register answer for matching question.');
        // var label = event.target.getAttribute('id');

        // var question = label.split('qstn-')[1].split('-answr-')[0];
        // var answer = label.split('-answr-')[1];
        errors[question-1] = [];

        var choice = event.target.getAttribute('name');
        var match = $('#' + event.target.getAttribute('id') + ' option:selected')[0].value;

        questions.exam[question] = questions.exam[question] || {};
        // questions.exam[question][answer] = choice + '-' + match;
        questions.exam[question][answer] = match;

        // console.log(question);
        // console.log(answer);
        // console.log(event.target.getAttribute('name'));
        // console.log($('#' + event.target.getAttribute('id') + ' option:selected')[0].value);
        
        


        var selected = [];
        $('select option:selected').each(function(idx, itm) { if (itm.value != '') selected.push(itm.value) });
        console.log(selected);
        // selected.length
        // console.log(Object.values(questions.exam[question]));
        if (Object.values(questions.exam[question]).some(el => el == '')) {
            errors[question-1].push('You have to match each answer.');
        }
        if ((new Set(selected).size) < selected.length) {
            errors[question-1].push('You cannot use single answer many times.');
        }

        var html = '';
        if (errors[question-1]) {
            for (var error of errors[question-1]) {
                html += '<div class="alert alert-danger" role="alert">'+error+'</div>';
            }
        }
        renderElement('.question-errors', html);
        
        console.log('Registered answer:');
        console.log(questions.exam[question]);

        countProgress();

        if ((answeredExamQuestions().length) == questions.used.length) {
            enableAction('#stop');
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

    if (questions.exam.length) {
        for (var i = 1; i < questions.exam.length; i++) {
            ratio = 1 / questions.used[i-1].answers.correct;
            point = 0;
            
            if (questions.exam[i] != undefined) {
                // summarize multiple checked answers
                for (var answer in questions.exam[i]) {
                    console.log(answer);
                    if (i in questions.exam
                        && (questions.exam[i][answer] === true
                        && questions.used[i-1].answers.choices[answer].type === 'correct')
                        || (questions.exam[i][answer] !== ''
                        && (slugify(questions.used[i-1].answers.choices[answer].name.split('==')[0].trim())+'-'+questions.exam[i][answer]) === questions.used[i-1].answers.choices[answer].slug
                        && questions.used[i-1].answers.choices[answer].type === 'correct')) {
                        point += ratio;
                    }
                }
                // any incorrect answer makes no points for this question
                if (ratio < 1) {
                    if (answer in questions.exam[i] 
                        && questions.exam[i][answer] === true 
                        && questions.used[i-1].answers.choices[answer].type === 'wrong'
                        || (questions.exam[i][answer] == ''
                        || (slugify(questions.used[i-1].answers.choices[answer].name.split('==')[0].trim())+'-'+questions.exam[i][answer]) === questions.used[i-1].answers.choices[answer].slug
                        || questions.used[i-1].answers.choices[answer].type === 'wrong')) {
                        point = 0;
                    }
                }
            }
            score += point;
        }
        score = score * 100 / questions.used.length;
    }

    

    return Math.floor(score);
}

'use strict';


// Handle registring answer used to calculate running challenge result
function registerAnswerForSimpleQuestion(event) {
    if (event.target.getAttribute('id')) {
        var label = event.target.getAttribute('id');
        var question = label.split('qstn-')[1].split('-answr-')[0];
        var answer = label.split('-answr-')[1];
        var type = questions['used'][question-1].params['type'];

        if (type == 'single' || type == 'multiple' || type == 'input') {
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
            if (type == 'input') {
                // questions.exam[question][answer] = event.target.value;
                // console.log(event.target.value);
            }
            console.log('Registered answer:');
            console.log(questions.exam[question]);

            // multi choice questions may have exact number of answers
            var answers = questions.used[question-1].params.answers;
            if (answers) {
                console.log(answers);
                errors[question-1] = [];
                if (Object.values(questions.exam[question]).filter(val => val == true).length != answers) {
                    errors[question-1].push('You have to choose '+answers+' answers.');
                    console.log(errors);
                }
            }
            renderErrors(question-1);

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

        errors[question-1] = [];

        var choice = event.target.getAttribute('name');
        var match = $('#' + event.target.getAttribute('id') + ' option:selected')[0].value;

        questions.exam[question] = questions.exam[question] || {};
        // questions.exam[question][answer] = choice + '-' + match;
        questions.exam[question][answer] = match;

        var selected = [];
        $('select option:selected').each(function(idx, itm) { if (itm.value != '') selected.push(itm.value) });
        console.log(selected);
        if (Object.values(questions.exam[question]).some(el => el == '')) {
            errors[question-1].push('You have to match each answer.');
        }
        if ((new Set(selected).size) < selected.length) {
            errors[question-1].push('You cannot use single answer many times.');
        }

        renderErrors(question-1);
    }
    if (type == 'input') {
        console.log('Register answer for input question.');

        questions.exam[question] = questions.exam[question] || {};
        questions.exam[question][0] = event.target.value;
    }
        
    console.log('Registered answer:');
    console.log(questions.exam[question]);

    countProgress();

    if ((answeredExamQuestions().length) == questions.used.length) {
        enableAction('#stop');
    }
}

// Handle showing correct answers on current question
function showCorrectAnswers() {
    var type = questions.used[challenge].params.type;
    if (type == 'single' || type == 'multiple') {
        for (var answer in questions.used[challenge].answers.choices) {
            if (questions.used[challenge].answers.choices[answer].type == 'correct') {
                document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-correct';
                document.querySelector('#qstn-'+(challenge+1)+'-answr-'+answer).className = 'custom-control-input is-valid';
            } else {
                document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-wrong';
                document.querySelector('#qstn-'+(challenge+1)+'-answr-'+answer).className = 'custom-control-input is-invalid';
            }
        }
    }
    if (type == 'matching') {
        for (var chc in questions.used[challenge].answers.choices) {
            var [answer, option] = questions.used[challenge].answers.choices[chc].name.split('==');
            var selected = $('#qstn-'+(challenge+1)+'-answr-'+chc+' option:selected').val();
            if (slugify(option.trim()) == selected) {
                document.querySelector('#qstn-'+(challenge+1)+'-answr-'+chc+'').className = 'custom-select is-valid';
            } else {
                document.querySelector('#qstn-'+(challenge+1)+'-answr-'+chc+'').className = 'custom-select is-invalid';
            }
        }
    }
    if (type == 'input') {
        for (var chc in questions.used[challenge].answers.choices) {
            var answer = questions.used[challenge].answers.choices[chc].name;
            console.log('#qstn-'+(challenge+1)+'-answr-'+chc+'');
            var written = document.querySelector('#qstn-'+(challenge+1)+'-answr-'+chc+'').value;
            if (slugify(answer.trim()) == slugify(written.trim())) {
                document.querySelector('#qstn-'+(challenge+1)+'-answr-'+chc+'').className = 'form-control is-valid';
            } else {
                console.log('potencial errors');
            }
        }
    }
    errors[challenge].push('Correct answers:' + questions.used[challenge].answers.choices[chc].some(function(el) { return el.name; }).join(', ') + '.');
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

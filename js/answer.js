'use strict';


// Handle registring answer used to calculate running challenge result
function registerAnswerForSimpleQuestion(event) {
    // console.log(event.target.name);
    var name = event.target.name;
    if (name == 'marker') {
        var label = event.target.getAttribute('id');
        var question = label.split('-')[1];
        questions.marked[question] = event.target.checked;
        console.log(questions.marked[question]);
    }
    if (name == 'answer') {
        var label = event.target.getAttribute('id');
        var question = label.split('q')[1].split('a')[0];
        var answer = label.split('a')[1];
        var type = questions['used'][question-1].params['type'];

        if (type == 'single' || type == 'multiple' || type == 'input') {
            console.log('registerAnswerForSimpleQuestion() has been used.');
            if (!(question in questions.exam)) {
                questions.exam[question] = {};
            }

            if (type == 'single') {
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
            
        }

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
    
            // renderErrors(question-1);
        }
        if (type == 'input') {
            console.log('Register answer for input question.');
    
            questions.exam[question] = questions.exam[question] || {};
            questions.exam[question][0] = event.target.value;
        }

        renderErrors(question-1);

        countProgress();

        storeExam();

        if ((answeredExamQuestions().length) == questions.used.length) {
            enableAction('stop');
        }
    }
}
// Handle registring answer used to calculate running challenge result
function registerAnswerForMatchingQuestion(event) {
    console.log('registerAnswerForSimpleQuestion() has been used.');
    var label = event.target.getAttribute('id');
    var question = label.split('q')[1].split('a')[0];
    var answer = label.split('a')[1];
    var type = questions['used'][question-1].params['type'];

    
        
    console.log('Registered answer:');
    console.log(questions.exam[question]);

    countProgress();

    if ((answeredExamQuestions().length) == questions.used.length) {
        enableAction('stop');
    }
}

// Handle showing correct answers on current question
function showCorrectAnswers(event) {
    console.log('showCorrectAnswers() has been used.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    console.log('Help event has been used.');
    var type = questions.used[challenge].params.type;
    if (type == 'single' || type == 'multiple') {
        for (var answer in questions.used[challenge].answers.choices) {
            if (questions.used[challenge].answers.choices[answer].type == 'correct') {
                document.querySelector('label[for="q'+(challenge+1)+'a'+answer+'"]').className += ' marked-correct';
                document.querySelector('#q'+(challenge+1)+'a'+answer).className = 'custom-control-input is-valid';
            } else {
                document.querySelector('label[for="q'+(challenge+1)+'a'+answer+'"]').className += ' marked-wrong';
                document.querySelector('#q'+(challenge+1)+'a'+answer).className = 'custom-control-input is-invalid';
            }
        }
    }
    if (type == 'matching') {
        for (var chc in questions.used[challenge].answers.choices) {
            var [answer, option] = questions.used[challenge].answers.choices[chc].name.split('==');
            var selected = $('#q'+(challenge+1)+'a'+chc+' option:selected').val();
            if (slugify(option.trim()) == selected) {
                document.querySelector('#q'+(challenge+1)+'a'+chc+'').className = 'custom-select is-valid';
            } else {
                document.querySelector('#q'+(challenge+1)+'a'+chc+'').className = 'custom-select is-invalid';
            }
        }
    }
    if (type == 'input') {
        for (var chc in questions.used[challenge].answers.choices) {
            var answer = questions.used[challenge].answers.choices[chc].name;
            console.log('#q'+(challenge+1)+'a'+chc+'');
            var written = document.querySelector('#q'+(challenge+1)+'a'+chc+'').value;
            if (slugify(answer.trim()) == slugify(written.trim())) {
                document.querySelector('#q'+(challenge+1)+'a'+chc+'').className = 'form-control is-valid';
            } else {
                console.log('potencial errors');
            }
        }
    }
    // errors[challenge].push('Correct answers:' + questions.used[challenge].answers.choices[chc].some(function(el) { return el.name; }).join(', ') + '.');
}

// Handle matching question with answers
function completeCorrectAnswers() {
    console.log('completeCorrectAnswers() has been used.');

    var type = questions.used[challenge].params.type;
    var question = challenge + 1;
    var option;
    var controls;

    if (type == 'single' || type == 'multiple') {
        controls = document.querySelectorAll('.answers .custom-control-input');
        controls.forEach(function(itm, i) {
            var answer = questions.used[challenge].answers.choices[i];
            if (answer.type == 'correct') {
                itm.checked = true;
                
                questions.exam[question] = questions.exam[question] || {};
                // if (i in questions.exam[question]) {
                //     questions.exam[question][i] = !questions.exam[question][i];
                // } else {
                questions.exam[question][i] = true;
                // }
            }
        });
    }

    if (type == 'matching') {
        controls = document.querySelectorAll('.answers .custom-select');
        controls.forEach(function(itm, i) {
            option = questions.used[challenge].answers.choices[i].name.split('==')[1].trim();
            itm.value = slugify(option);
            // itm.dispatchEvent(new Event('change'));
            
            // if ('createEvent' in document) {
            //     var evt = document.createEvent('HTMLEvents');
            //     evt.initEvent('change', false, true);
            //     itm.dispatchEvent(evt);
            // } else {
            //     itm.fireEvent('onchange');
            // }

            questions.exam[question] = questions.exam[question] || {};
            questions.exam[question][i] = itm.value;
        });
    }
}

// Handle mapping answers
function processAnswers(question) {
    var result = {'correct': 0, 'wrong': 0, 'choices': [], 'processed': true, 'shuffled': false};
    result.choices = question.answers;
    result.correct = question.counter.correct;
    result.wrong = question.counter.wrong;

    var shuffleAnswers = 'shuffle_answers' in question.params ? question.params.shuffle_answers : 'true';
    shuffleAnswers = (shuffleAnswers == 'true');
    console.log('shuffled: ' + shuffleAnswers);
    if (properties['quiz_answers_shuffle'] && shuffleAnswers) {
        result.choices = shuffleArray(result.choices);
        result.shuffled = true;
    }
    return result;
}

// Handle exam result calculations
function validateExamAnswers() {
    var score = 0;
    var point;
    var ratio;
    var matches;

    var summary = {'score': 0, 'correct': [], 'wrong': []};

    if (questions.exam.length) {
        for (var i = 1; i < questions.exam.length; i++) {
            ratio = 1 / questions.used[i-1].answers.correct;
            point = 0;
            
            if (questions.exam[i] != undefined) {
                console.log('\nQuestion: ' + questions.used[i-1].name);
                console.log('Ratio:    ' + ratio);
                // summarize multiple checked answers
                for (var answer in questions.exam[i]) {
                    if (questions.used[i-1].answers.choices[answer].name.indexOf('==') != -1) {
                        matches = questions.used[i-1].answers.choices[answer].name.split('==').map(val => slugify(val.trim()));
                    }
                    // console.log(answer);
                    if ((questions.exam[i][answer] === true
                        && questions.used[i-1].answers.choices[answer].type === 'correct')
                        || (questions.exam[i][answer] !== ''
                        && matches && matches[0]+'-'+questions.exam[i][answer] === matches[0]+'-'+matches[1]
                        && questions.used[i-1].answers.choices[answer].type === 'correct')
                        || (questions.exam[i][answer] !== ''
                        && questions.used[i-1].answers.choices[answer].slug === slugify((questions.exam[i][answer] + '').trim())
                        && questions.used[i-1].answers.choices[answer].type === 'correct')) {
                        point += ratio;
                    }
                }
                console.log('Checking correct answers: ' + point);
                if (ratio < 1) {
                    for (var answer in questions.exam[i]) {
                        if (questions.used[i-1].answers.choices[answer].name.indexOf('==') != -1) {
                            matches = questions.used[i-1].answers.choices[answer].name.split('==').map(val => slugify(val.trim()));
                            if (matches[0]+'-'+questions.exam[i][answer] !== matches[0]+'-'+matches[1]) {
                                point = 0;
                            }
                        } else {
                            if ((questions.exam[i][answer] === true 
                                && questions.used[i-1].answers.choices[answer].type === 'wrong')
                                || questions.exam[i][answer] == '') {
                                point = 0;
                            }
                        }
                    }
                }
                console.log('Checking wrong answers: ' + point);
            }
            console.log(point);
            if (point == 1 || (parseInt(point * 1000) == 999)) {
                summary.correct.push(questions.exam[i]);
                questions.answered[i] = 'correct';
            } else {
                summary.wrong.push(questions.exam[i]);
                questions.answered[i] = 'wrong';
            }
            score += point;
        }
        score = score * 100 / questions.used.length;
    }
    summary.score = Math.floor(score);
    
    return summary;
}


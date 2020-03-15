'use strict';

// Handle previous question for running challenge
function prevQuestion(event) {
    console.log('Prev event has been triggered.');
    if (event.target.className.indexOf('disabled') != -1) {
        return;
    }
        
    if (challenge > 0) {
        challenge--;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }

    if (challenge == 0) {
        disableAction('prev');
    } else {
        enableAction('prev');
    }
    enableAction('next');
}

// Handle next question for running challenge
function nextQuestion(event) {
    console.log('Next event has been triggered.');
    if (event.target.className.indexOf('disabled') != -1) {
        return;
    }
    
    if (challenge < limit-1) {
        challenge++;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }

    if (challenge == limit-1) {
        disableAction('next');
    } else {
        enableAction('next');
    }
    enableAction('prev');
}

function prepareSimpleQuestion(q, mode) {
    var id, answer, checked, answerClass;
    var answers = processAnswers(q.answers);
    var html = '';
    if (mode == 'print') {
        html += '<div class="question">' + q.name.replace('<p>', '<p>' + q.index + '. ') + '</div>';
    } else {
        html += '<div class="question">' + q.name + '</div>';
    }
    for (var ans in answers.choices) {
        id = 'qstn-'+q.index+'-answr-'+ans+'';
        answer = answers.choices[ans].name;
        if (q.index in questions.exam && ans in questions.exam[q.index] && questions.exam[q.index][ans] == true) {
            checked = true;
        } else {
            checked = false;
        }
        // correct answer
        if (mode == 'print') {
            answerClass = answers.choices[ans].type == 'wrong' ? ' marked-wrong' : ' marked-correct';
        } else {
            answerClass = '';
        }
        if (answers.choices.length - answers.wrong > 1) {
            // multi choice
            html += '<div class="custom-control custom-checkbox">'
                +'<input type="checkbox" id="'+id+'" name="customCheckbox" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
            +'</div>';
        } else {
            // single choice
            html += '<div class="custom-control custom-radio">'
                +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
            +'</div>';
        }
    }
    return html;
}
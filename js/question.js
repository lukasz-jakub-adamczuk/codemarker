'use strict';

// Handle previous question for running challenge
function prevQuestion(event) {
    console.log('Prev event has been triggered.');
    if ($('#prev').hasClass('disabled')) {
        return;
    }
        
    if (challenge > 0) {
        challenge--;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }

    if (challenge == 0) {
        disableAction('#prev');
    } else {
        enableAction('#prev');
    }
    enableAction('#next');
}

// Handle next question for running challenge
function nextQuestion(event) {
    console.log('Next event has been triggered.');
    if ($('#next').hasClass('disabled')) {
        return;
    }
    
    if (challenge < limit-1) {
        challenge++;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }

    if (challenge == limit-1) {
        disableAction('#next');
    } else {
        enableAction('#next');
    }
    enableAction('#prev');
}

function prepareSimpleQuestion(q, mode) {
    var id, answer, checked, answerClass, letter = '';
    if (!q.answers.processed) {
        q.answers = processAnswers(q.answers);
    }
    var answers = q.answers;
    var html = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + q.index + '. ') + '</div>';
    } else {
        html += '<div class="question">' + marked(q.name) + '</div>';
    }
    html += '<div class="answers">';
    for (var ans in answers.choices) {
        id = 'qstn-'+q.index+'-answr-'+ans+'';
        answer = answers.choices[ans].name;
        if (q.index in questions.exam && ans in questions.exam[q.index] && questions.exam[q.index][ans] == true) {
            checked = true;
        } else {
            checked = false;
        }
        if (properties['quiz.answers.print_letters']) {
            letter = '<span class="answer-letter">'+letters[ans].toUpperCase()+'.</span>';
        }
        // correct answer
        answerClass = '';
        if (mode == 'print') {
            answerClass = answers.choices[ans].type == 'wrong' ? ' marked-wrong' : ' marked-correct';
        }
        if (answers.choices.length - answers.wrong > 1) {
            // multi choice
            html += '<div class="custom-control custom-checkbox">'+letter
                +'<input type="checkbox" id="'+id+'" name="customCheckbox" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
            +'</div>';
        } else {
            // single choice
            if (mode != 'print' || (mode == 'print' && answers.choices[ans].type == 'correct') || (mode == 'print' && properties['print.answers.print_incorrect'] && answers.choices[ans].type == 'wrong')) {
            html += '<div class="custom-control custom-radio">'+letter
                +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
            +'</div>';}
        }
    }
    html += '</div>';
    return html;
}

function prepareMatchingQuestion(q, mode) {
    var id, answer, choice, selected, answerClass;
    if (!q.answers.processed) {
        q.answers = processAnswers(q.answers);
    }
    var answers = q.answers;
    var html = '';
    var matching = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + q.index + '. ') + '</div>';
    } else {
        html += '<div class="question">' + marked(q.name) + '</div>';
    }
    
    // prepare choices for matching
    var choices = [];
    for (var choice of answers.choices) {
        var chc = choice.name.split('==');
        choices.push({'choice': chc[0].trim(), 'answer': chc[1].trim()});
    }
    choices = shuffleArray(choices);

    html += '<div class="answers">';
    for (var ans in answers.choices) {
        id = 'qstn-'+q.index+'-answr-'+ans+'';
        answer = answers.choices[ans].name.split('==')[0].trim();
        choice = answers.choices[ans].name.split('==')[1].trim();
        
        // correct answer
        answerClass = '';
        if (mode == 'print') {
            answerClass = answers.choices[ans].type == 'wrong' ? ' marked-wrong' : ' marked-correct';
        }

        html += '<div class="matching-control">'
            // +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
            +'<label class="matching-control-label" for="'+id+'">'+answer+'</label>'
            +'<select class="custom-select" id="'+id+'" name="'+slugify(answer)+'">';
            html +='<option value="">choose answer</option>'
            // for (var mtch in answers.choices) {
            //     matching = answers.choices[mtch].name.split('==')[1].trim();
            //     html +='<option value="'+slugify(matching)+'">' + matching + '</option>'
            // }
            for (var match of choices) {
                selected = '';
                if (q.index in questions.exam && ans in questions.exam[q.index] && questions.exam[q.index][ans] == slugify(match.answer)) {
                    selected = ' selected';
                }
                if (mode == 'print' && choice == match.answer) {
                    selected = ' selected';
                }

                html +='<option value="'+slugify(match.answer)+'"'+selected+'>' + match.answer + '</option>'
            }
            html +='</select>'
        +'</div>';
    }
    html += '</div>';
    return html;
}

function prepareInputQuestion(q, mode) {
    var id, answer, choice, written, answerClass;
    if (!q.answers.processed) {
        q.answers = processAnswers(q.answers);
    }
    var answers = q.answers;

    id = 'qstn-'+q.index+'-answr-0';
    // answer = answers.choices[ans].name;

    var choices = questions.used[q.index-1].answers.choices.map(function(elem, index, array) { return elem.name; });
    for (var ans in answers.choices) {
        if (q.index in questions.exam && ans in questions.exam[q.index] && questions.exam[q.index][0] in choices) {
            written = questions.exam[q.index][0];
        } else {
            written = '';
        }
    }

    var input = '<input type="text" id="'+id+'" name="aaa" value="'+written+'" class="form-control" />';

    console.log();

    var html = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + q.index + '. ') + '</div>';
    } else {
        html += '<div class="question">' + marked(q.name).replace('[]', input) + '</div>';
    }


    return html;
}
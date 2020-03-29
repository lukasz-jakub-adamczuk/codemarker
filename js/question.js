'use strict';

// Handle previous question for running challenge
function prevQuestion(event) {
    console.log('prevQuestion() has been used.');
    if ($('#prev-button').hasClass('disabled')) {
        return;
    }

    console.log('Prev event has been triggered.');    
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
    console.log('nextQuestion() has been used.');
    if ($('#next-button').hasClass('disabled')) {
        return;
    }
    
    console.log('Next event has been triggered.');
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
    var id, answer, checked, answerClass, letter = '';
    if (!q.answers.processed) {
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;
    var html = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';
    } else {
        html += '<div class="question">' + marked(q.name) + '</div>';
    }
    html += '<div class="answers">';
    for (var ans in answers.choices) {
        id = 'q'+idx+'a'+ans+'';
        answer = answers.choices[ans].name;
        if (idx in questions.exam && ans in questions.exam[idx] && questions.exam[idx][ans] == true) {
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
            if (mode != 'print' || (mode == 'print' && answers.choices[ans].type == 'correct') || (mode == 'print' && properties['print.answers.print_incorrect'] && answers.choices[ans].type == 'wrong')) {
                html += '<div class="custom-control custom-checkbox">'+letter
                    +'<input type="checkbox" id="'+id+'" name="customCheckbox" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                    +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
                +'</div>';
            }
        } else {
            // single choice
            if (mode != 'print' || (mode == 'print' && answers.choices[ans].type == 'correct') || (mode == 'print' && properties['print.answers.print_incorrect'] && answers.choices[ans].type == 'wrong')) {
                html += '<div class="custom-control custom-radio">'+letter
                    +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                    +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
                +'</div>';
            }
        }
    }
    html += '</div>';
    return html;
}

function prepareMatchingQuestion(q, mode) {
    var id, answer, choice, selected, answerClass;
    if (!q.answers.processed) {
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;
    var html = '';
    var matching = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';
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
        id = 'q'+idx+'a'+ans+'';
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
                if (idx in questions.exam && ans in questions.exam[idx] && questions.exam[idx][ans] == slugify(match.answer)) {
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
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;

    id = 'q'+idx+'a0';
    // answer = answers.choices[ans].name;

    var choices = questions.used[idx-1].answers.choices.map(function(elem, index, array) { return elem.name; });
    for (var ans in answers.choices) {
        if (idx in questions.exam && ans in questions.exam[idx] && questions.exam[idx][0] in choices) {
            written = questions.exam[idx][0];
        } else {
            written = '';
        }
    }

    var input = '<input type="text" id="'+id+'" name="aaa" value="'+written+'" class="form-control" />';

    console.log();

    var html = '';
    if (mode == 'print') {
        html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';
    } else {
        html += '<div class="question">' + marked(q.name).replace('[]', input) + '</div>';
    }


    return html;
}

function printSimpleQuestion(q, challenge) {
    var id, answer, checked, answerClass, letter = '';
    if (!q.answers.processed) {
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;
    var html = '';
    var inputState = '';
    
    html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';
    if (q.params.image) {
        html += '<img class="question-image" src="' + q.params.image + '" />';
    }
    // console.log(idx);
    // console.log(q.name);
    // console.log(q.answers);
    html += '<div class="answers">';
    for (var ans in answers.choices) {
        id = 'q'+idx+'a'+ans+'';
        answer = answers.choices[ans].name;
        // checked = true;
        if (answers.choices[ans].type == 'correct') {
            checked = true;
            inputState = 'checked';
        } else {
            checked = false;
            inputState = 'unchecked';
        }
        if (properties['quiz.answers.print_letters']) {
            letter = '<span class="answer-letter">'+letters[ans].toUpperCase()+'.</span>';
        }
        // correct answer
        // answerClass = '';
        answerClass = answers.choices[ans].type == 'wrong' ? ' marked-wrong' : ' marked-correct';


        if (answers.choices.length - answers.wrong > 1) {
            // multi choice
            if (answers.choices[ans].type == 'correct' || (properties['print.answers.print_incorrect'] && answers.choices[ans].type == 'wrong')) {
                html += '<div class="custom-control custom-checkbox">'+letter
                    +'<input type="checkbox" id="'+id+'" name="'+id+'" class="custom-control-input '+inputState+'" value="'+slugify(answer)+'"'+(checked ? ' checked="checked"' : '')+' >'
                    +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
                +'</div>';
            }
        } else {
            // single choice
            if (answers.choices[ans].type == 'correct' || (properties['print.answers.print_incorrect'] && answers.choices[ans].type == 'wrong')) {
                html += '<div class="custom-control custom-radio">'+letter
                    +'<input type="radio" id="'+id+'" name="'+id+'" class="custom-control-input '+inputState+'" value="'+slugify(answer)+'"'+(checked ? ' checked="checked"' : '')+' >'
                    +'<label class="custom-control-label'+answerClass+'" for="'+id+'">'+answer+'</label>'
                +'</div>';
            }
        }
    }
    html += '</div>';
    return html;
}

function printMatchingQuestion(q, challenge) {
    var id, answer, choice, selected, answerClass;
    if (!q.answers.processed) {
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;
    var html = '';
    var matching = '';
    
    html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';

    if (q.params.image) {
        html += '<img class="question-image" src="' + q.params.image + '" />';
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
        id = 'q'+idx+'a'+ans+'';
        answer = answers.choices[ans].name.split('==')[0].trim();
        choice = answers.choices[ans].name.split('==')[1].trim();
        
        // correct answer
        answerClass = answers.choices[ans].type == 'wrong' ? ' marked-wrong' : ' marked-correct';

        html += '<div class="matching-control">'
            +'<label class="matching-control-label" for="'+id+'">'+answer+'</label>'
            +'<select class="custom-select" id="'+id+'" name="'+slugify(answer)+'">';
            html +='<option value="">choose answer</option>'
            for (var match of choices) {
                selected = '';
                if (idx in questions.exam && ans in questions.exam[idx] && questions.exam[idx][ans] == slugify(match.answer)) {
                    selected = ' selected';
                }
                if (choice == match.answer) {
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

function printInputQuestion(q, challenge) {
    var id, answer, choice, written, answerClass;
    if (!q.answers.processed) {
        q.answers = processAnswers(q);
    }
    var answers = q.answers;
    var idx = challenge+1;

    id = 'q'+idx+'a0';
    // answer = answers.choices[ans].name;

    var choices = questions.all[idx-1].answers.choices.map(function(elem, index, array) { return elem.name; });
    for (var ans in answers.choices) {
        // if (idx in questions.exam && ans in questions.exam[idx] && questions.exam[idx][0] in choices) {
            written = questions.all[idx-1][0];
        // } else {
        //     written = '';
        // }
    }

    var input = '<input type="text" id="'+id+'" name="aaa" value="'+written+'" class="form-control" />';

    console.log();

    var html = '';
    
    html += '<div class="question">' + marked(q.name).replace('<p>', '<p>' + idx + '. ') + '</div>';
    if (q.params.image) {
        html += '<img class="question-image" src="' + q.params.image + '" />';
    }
    

    return html;
}
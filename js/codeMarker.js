// Handle starting new challenge for user
function startChallenge(event) {
    console.log('Start event has been triggered.');
    if (event && event.target.className.indexOf('disabled') != -1) {
        return;
    }
    hideElement('exams');
    showElement('challenge');
    // enable nav buttons
    enableAction('next');
    enableAction('answers');
    // reset used questions
    initChallenge();
    renderProgress(0);
    // generate first questions
    generateQuestion(questions.used[challenge]);
    
    // start timer
    time = allExams[exam].duration * 60;
    timer();
    // start interval
    displayTimer = setInterval(function() {
        time--;
        timer();
        if (time <= 0) {
            finishChallenge();
        }
    }, 1000);
    // event.preventDefault();

    disableAction('start');
    disableAction('print');
}

// Internal function to init challenge
function initChallenge() {
    if (properties['quiz.questions.shuffle']) {
        questions.all = shuffleArray(questions.all);
    }
    questions.used = reorderArray(questions.all.slice(0, allExams[exam].questions));
    // questions.used = reorderArray(questions.all);
    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
}

// Handle finishing running challenge
function finishChallenge() {
    clearInterval(displayTimer);
    // hide nav buttons
    disableAction('prev');
    disableAction('next');
    disableAction('answers');

    enableAction('start');
    
    renderExamResult();
}

// Handle generating question
function generateQuestion(q, mode) {
    var answers;
    var html = '';
    var id = '';
    var answer = '';
    var matching = '';
    var checked = false;
    var answerClass;

    // if (q.processed) {
    //     answers = q.answers;
    // } else {
    //     answers = processAnswers(q.answers);
    //     q.answers = answers;
    //     q.processed = true;
    // }

    // if (answers.shuffled) {
    //     answers.choices = answers.choices;
    // } else {
    //     answers.choices = shuffleArray(answers.choices);
    //     answers.shuffled = true;
    //     q.answers = answers;
    // }

    if (mode != 'print') {
        html += '<b class="text-muted vam">Question ' + q.index + '</b>';
        html += (q.params.area ? ' <span class="badge badge-secondary"> ' + q.params.area + '</span>' : '');
//     html += ' <span class=""> Length: ' + q.length + '</span>';
    }
    if ('type' in q.params) {
        if (q.params.type == 'input') {
            id = 'qstn-'+q.index+'-answr-0';
            answer = answers.choices[0].name;
            var input = '<input type="text" name="" />';
            html += '<h2>' + q.name.replace('[]', input) + '</h2>';
        }
        if (q.params.type == 'matching') {
            html += '<div class="question">' + q.name + '</div>';
            for (var ans in answers.choices) {
                id = 'qstn-'+q.index+'-answr-'+ans+'';
                answer = answers.choices[ans].name.split('==')[0].trim();
                html += '<div class="custom-control_ custom-radio_">'
                    // +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                    +'<label class="custom-control-label" for="'+id+'" style="width: 40%;">'+answer+'</label>'
                    +'<select class="" name="">';
                    html +='<option value="">choose answer</option>'
                    for (var mtch in answers.choices) {
                        matching = answers.choices[mtch].name.split('=')[1].trim();
                        html +='<option value="">' + matching + '</option>'
                    }
                    html +='</select>'
                +'</div>';
            }
        }
        if (q.params.type == 'single' || q.params.type == 'multiple') {
            html += prepareSimpleQuestion(q, mode);
            /*if (mode == 'print') {
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
            }*/
        }
    }

    var scale = 100;
    // scale question
    // if (q.length > 512) {
    //     scale = 100;
    // } else if (q.length > 256 && q.length <= 512) {
    //     scale = 125;
    // } else {
    //     scale = 150;
    // }

    

    if (mode == 'print') {
        return html;
    };
    renderElement('#challenge', '<div style="font-size: '+scale+'%;">' + html + '</div>');
}





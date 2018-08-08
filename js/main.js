
var questions = {
    'all': [],
    'used': [],
    'exam': []
};
var challenge;
var limit;
var displayTimer;


var initialSetup = {};

var exam;
var time;

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      // Display file content
      displayContents(contents);
    };
    reader.readAsText(file);
}
 
function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.innerHTML = contents;
    
    var parts = contents.split('\n');

    console.log(parts[0]);

    // simple parser
    var question = {};
    var setup;
    var line = '';
    var answer = '';
    var paramsFound = false;
    var n = 0;
    lengths = [];

    for (var i = 0; i < parts.length; i++) {
        line = parts[i].trim();
        if (line != '') {
            // init
            question.length = question.length || 0;
            question.processed = false;

            question.params = question.params || {};

            question.answers = question.answers || {};
            question.answers.correct = question.answers.correct || {};
            question.answers.wrong = question.answers.wrong || {};
            
            switch(line[0]) {
                case '+':
                    answer = line.substr(1,).trim();
                    question.answers.correct[slugify(answer)] = answer;
                    question.length += answer.length;
                    break;
                case '-':
                    answer = line.substr(1,).trim();
                    question.answers.wrong[slugify(answer)] = answer;
                    question.length += answer.length;
                    break;
                case '{':
                    question.params += line;
                    paramsFound = true;
                    if (line.trim().substr(-1) == '}') {
                        console.log(line);
                        question.params = JSON.parse(line);
                        paramsFound = false;
                    }
                    break;
                case '#':
                    setup = line.substr(1,).trim().split(':');
                    if (setup.length > 1) {
                        if (setup[0] == 'exam') {
                            exam = 'cm-' + setup[1].trim();
                            initialSetup[exam] = {};
                            initialSetup[exam].name = setup[1].trim();
                        } else {
                            initialSetup[exam][setup[0]] = setup[1].trim();
                        }
                    }
                    break;
                default:
                    if (paramsFound) {
                        question.params += line;
                        if (line.trim().substr(-1) == '}') {
                            console.log(question.params);
                            question.params = JSON.parse(question.params);
                            paramsFound = false;
                        }
                    } else {
                        if (question.name) {
                            questions.all[n] = question;
                            lengths.push(question.length);
                            question = {};
                            
                            question.length = 0;
                            n++;
                        }
                        question.name = line;
                        question.length += line.length;
                        question.index = n;
                    }
                    break;
            }
        }
    }
    // last question
    questions.all[n] = question;

    initialSetup[exam].all = questions.all.length;
    
    // store in localStorage when exam is known  
    if ('localStorage' in window) {
        localStorage.setItem(exam, document.getElementById('file-content').innerHTML);
        localStorage.setItem('initialSetup', JSON.stringify(initialSetup));
    }

    toggleElement('start');
}

function processAnswers(answers) {
    var result = {'correct': 0, 'wrong': 0, 'choices': [], 'processed': true, 'shuffled': false};
    var types = ['correct', 'wrong'];
    var answer;
    for (var type in types) {
        if (answers[types[type]]) {
            for (var ans in answers[types[type]]) {
                answer = {
                    'type': types[type],
                    'slug': ans,
                    'name': answers[types[type]][ans]
                };
                result.choices.push(answer);
                result[types[type]]++;
            }
        }
    }
    return result;
}

function retrieveQuestions() {
    var code = document.getElementById('retrieve-code').value;
    var req = new XMLHttpRequest();

    req.open('POST', 'https://ash.unixstorm.org/codemarker/cloud/index.php', false); 
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send('code=' + code);

    if (req.status == 200) {
        displayContents(req.responseText);
    }
}

function generateQuestion(q) {
    var answers;
    var html = '';
    var id = '';
    var answer = '';
    var checked = false;

    if (q.processed) {
        answers = q.answers;
    } else {
        answers = processAnswers(q.answers);
        q.answers = answers;
        q.processed = true;
    }

    if (answers.shuffled) {
        answers.choices = answers.choices;
    } else {
        answers.choices = shuffleArray(answers.choices);
        answers.shuffled = true;
        q.answers = answers;
    }

    html += '<b class="text-muted vam">Question ' + q.index + '</b>';
    html += (q.params.area ? ' <span class="badge badge-secondary"> ' + q.params.area + '</span>' : '');
//     html += ' <span class=""> Length: ' + q.length + '</span>';
    html += '<h2>' + q.name + '</h2>';
        
    for (var ans in answers.choices) {
        id = 'qstn-'+q.index+'-answr-'+ans+'';
        answer = answers.choices[ans].name;
        if (q.index in questions.exam && ans in questions.exam[q.index]) {
            checked = true;
        } else {
            checked = false;
        }
        if (answers.choices.length - answers.wrong > 1) {
            // multi choice
            html += '<div class="custom-control custom-checkbox">'
                +'<input type="checkbox" id="'+id+'" name="customCheckbox" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label" for="'+id+'">'+answer+'</label>'
            +'</div>';
        } else {
            // single choice
            html += '<div class="custom-control custom-radio">'
                +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input" value="'+slugify(answer)+'"'+(checked ? ' checked' : '')+'>'
                +'<label class="custom-control-label" for="'+id+'">'+answer+'</label>'
            +'</div>';
        }
    }

    var scale = 100;
    // scale question
    if (q.length > 512) {
        scale = 100;
    } else if (q.length > 256 && q.length <= 512) {
        scale = 125;
    } else {
        scale = 150;
    }

    document.querySelector('.container').innerHTML = '<div style="font-size: '+scale+'%;">' + html + '</div>';
}


function prevQuestion(event) {
    if (challenge > 0) {
        challenge--;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }
}

function nextQuestion(event) {
    if (challenge < limit-1) {
        challenge++;
        generateQuestion(questions.used[challenge]);
        event.preventDefault();
    }
}

function initChallenge() {
    questions.all = shuffleArray(questions.all);
    questions.used = reorderArray(questions.all.slice(0, initialSetup[exam].questions));
    questions.exam = [];
    challenge = 0;
    limit = questions.used.length;
}

function startChallenge(event) {
    // reset used questions
    initChallenge();
    setProgress(0);
    // generate first questions
    generateQuestion(questions.used[challenge]);
    hideElement('select-exam');
    // show nav buttons
    toggleElement('prev');
    toggleElement('next');
    toggleElement('help');
    // start timer
    time = initialSetup[exam].duration * 60;
    timer();
    // start interval
    displayTimer = setInterval(function() {
        time--;
        timer();
        if (time <= 0) {
            finishChallenge();
        }
    }, 1000);
    event.preventDefault();
    toggleElement('start', 1000);
}
function finishChallenge() {
    // timerStop();
    clearInterval(displayTimer);
    // hide nav buttons
    toggleElement('prev');
    toggleElement('next');
    toggleElement('help');
    showResult();
    toggleElement('start');
    hideElement('finish');

    challenge = 0;
}

function showResult() {
    var score = validateExamAnswers();
    var result;
    var advice;

    if (score >= 80) {
        result = '<div class="result passed"></div>';
        advice = 'Your score is '+score+'%. Congratulations!';
    }
    if (score > 50 && score < 80) {
        result = '<div class="result failed"></div>';
        advice = 'Your score is '+score+'%. Try again.';
    }
    if (score < 50) {
        result = '<div class="result epic-fail"></div>';
        advice = 'Your score is '+score+'% only. Learn more.';
    }

    document.getElementById('container').innerHTML = result + '<p class="advice">' + advice + '</p>';
    // document.getElementById('timer').innerHTML = advice;
}

function showCorrectAnswers() {
    for (var answer in questions.used[challenge].answers.choices) {
        if (questions.used[challenge].answers.choices[answer].type == 'wrong') {
            document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-wrong';
        } else {
            document.querySelector('label[for="qstn-'+(challenge+1)+'-answr-'+answer+'"]').className += ' marked-correct';
        }

    }
}

function registerAnswer(event) {
    if (event.target.getAttribute('id')) {
        var label = event.target.getAttribute('id');

        var question = label.split('qstn-')[1].split('-answr-')[0];
        var answer = label.split('-answr-')[1];

        if (question in questions.exam) {
        } else {
            questions.exam[question] = {};
        }
        // console.log(exam);
        if (answer in questions.exam[question]) {
            questions.exam[question][answer] = event.target.getAttribute('checked') != '' ? false : true;
        } else {
            questions.exam[question][answer] = true;
        }
        countProgress();

        if ((answeredExamQuestions().length) == initialSetup[exam].questions) {
            showElement('finish');
        }
    }
}

function countProgress() {
    var answered = answeredExamQuestions();
    var current = answered.length / initialSetup[exam].questions * 100;
    setProgress(current);
}

function setProgress(value) {
    document.querySelector('.progresso span').style = 'width: ' + value + '%;';
}

function answeredExamQuestions() {
    return questions.exam.filter(function(elem, index, array) { return typeof elem != 'undefined';})
}

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
    console.log('Your score: ' + score + '%');

    score = score * 100 / initialSetup[exam].questions;

    return Math.floor(score);
}

function selectExam(event) {
    for (var elem in event.path) {
        // console.log(event.path[elem]);
        if (event.path[elem].getAttribute('id')) {
            exam = event.path[elem].getAttribute('id');
            // if (availableExams[0] in localStorage) {
        //     exam = availableExams[0];
            displayContents(localStorage.getItem(exam));
        // }
            break;
        }
    }
    showElement('start');
}

if ('localStorage' in window) {
    var availableExams = [];
    if ('initialSetup' in localStorage) {
        initialSetup = JSON.parse(localStorage.getItem('initialSetup'));
    }
    for (var prop in localStorage) {
        if (prop.substr(0, 2) == 'cm') {
            availableExams.push(prop);
        }
    }
    // take first
    if (availableExams.length) {
        // if (availableExams[0] in localStorage) {
        //     exam = availableExams[0];
        //     displayContents(localStorage.getItem(availableExams[0]));
        // }
    }
    // print available exams
    var html = '<div class="list-group">';
    for (var i in availableExams) {
    html += '<a id="cm-'+initialSetup[availableExams[i]].name+'" class="list-group-item list-group-item-action flex-column align-items-start">'
        + '<div class="d-flex w-100 justify-content-between">'
        + '<h5 class="mb-1">'+initialSetup[availableExams[i]].name.split('-').join(' ').toUpperCase()+'</h5>'
        + '<small>'+initialSetup[availableExams[i]].questions+' questions in '+initialSetup[availableExams[i]].duration+'min</small>'
        + '</div>'
        + '<p class="mb-1">'+initialSetup[availableExams[i]].description+'</p>'
        + '<small>'+initialSetup[availableExams[i]].all+' questions available</small>'
    + '</a>'
    }
    html += '</div>';
    document.getElementById('select-exam').innerHTML = html;
}




// adding events

// options
document.getElementById('file-input').addEventListener('change', readSingleFile, false);
document.getElementById('load').addEventListener('click', function() { document.getElementById('file-input').click(); }, false);
document.getElementById('retrieve').addEventListener('click', retrieveQuestions, false);


// challenge
document.getElementById('prev').addEventListener('click', prevQuestion, false);
document.getElementById('next').addEventListener('click', nextQuestion, false);
document.getElementById('help').addEventListener('click', showCorrectAnswers, false);

document.getElementById('start').addEventListener('click', startChallenge, false);
document.getElementById('finish').addEventListener('click', finishChallenge, false);

document.getElementById('container').addEventListener('click', registerAnswer, true);
document.getElementById('select-exam').addEventListener('click', selectExam, true);


var arrows = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};

window.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case arrows.left:
            prevQuestion(event);
            break;
        case arrows.right:
            nextQuestion(event);
            break;
    }
});


function timer() {
    var hours   = Math.floor(time / 3600);
    var minutes = Math.floor((time - (hours*3600)) / 60);
    var seconds = Math.floor(time - (hours*3600) - (minutes*60));
    var timer = (hours+'').padStart(2, '0') + ':' + (minutes+'').padStart(2, '0') + ':' + (seconds+'').padStart(2, '0');
    document.getElementById('timer').innerHTML = timer;
    // console.log(time);
}








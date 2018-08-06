
var questions = {
    'all': [],
    'used': [],
    'exam': []
};
var challenge;
var limit;
var displayTimer;

var initialSetup = {
    'sys-admin': {
        questions: 60,
        duration: 130,
        pass: 80
    },
    'cis-itsm': {
        questions: 60,
        // questions: 5,
        duration: 130,
        // duration: 1,
        pass: 80
    },
    'cis-hr': {
        questions: 60,
        duration: 130,
        pass: 80
    }
};

var cert = 'cis-itsm';
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
    if ('localStorage' in window) {
        localStorage.setItem(cert, document.getElementById('file-content').innerHTML);
    }
    var parts = contents.split('\n');

    // simple parser
    var question = {};
    // var init = {prcess}
    var line = '';
    var answer = '';
    var paramsFound = false;
    // var questionFound = false;
    // var questionAdded = false;
    var n = 0;
    lengths = [];

    for (var i = 0; i < parts.length; i++) {
        line = parts[i].trim();
        if (line != '') {
            // if (!question.answers) {
            //     question.answers = {};
            //     if (!question.answers.correct) {
            //         question.answers.correct = {};
            //     }
            //     if (!question.answers.wrong) {
            //         question.answers.wrong = {};
            //     }
            // }

            // init
            question.length = question.length || 0;
            question.processed = false;

            question.params = question.params || {};

            question.answers = question.answers || {};
            question.answers.correct = question.answers.correct || {};
            question.answers.wrong = question.answers.wrong || {};
            
            // console.log(parts[i].trim().toLowerCase());
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
                        
                        // question.params = {};

                        // if (questionFound && !questionAdded) {
                        //     console.
                        //     questions.all[n] = question;
                        //     questionAdded = false;
                        // }
                        // if (question.name) {
                        //     questions.all[n] = question;
                        //     question = {};
                        //     n++;
                        // }
                    }
                    break;
            }
            // console.log(question.length);
        }
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
    html += ' <span class=""> Length: ' + q.length + '</span>';
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
    questions.used = reorderArray(questions.all.slice(0, initialSetup[cert].questions));
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
    // show nav buttons
    toggleElement('prev');
    toggleElement('next');
    toggleElement('help');
    // start timer
    time = initialSetup[cert].duration * 60;
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

        if ((answeredExamQuestions().length) == initialSetup[cert].questions) {
            showElement('finish');
        }
    }
}

function countProgress() {
    var answered = answeredExamQuestions();
    var current = answered.length / initialSetup[cert].questions * 100;
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

    score = score * 100 / initialSetup[cert].questions;

    return Math.floor(score);
}


if ('localStorage' in window) {
    if (cert in localStorage) {
        displayContents(localStorage.getItem(cert));
    }
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








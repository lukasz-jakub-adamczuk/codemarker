
var questions = [];
var challenge;
var limit;

var initialSetup = {
    'sys-admin': {
        questions: 60,
        duration: 130,
        pass: 80
    },
    'cis-hr': {
        questions: 60,
        duration: 130,
        pass: 80
    }
};
var exam = 'cis-hr';
var time = initialSetup[exam].duration * 60;

var exam = {
    questions: [],
    score: 0,
}


function processAnswers(answers) {
    var result = {'correct': 0, 'wrong': 0, 'choices': [], 'processed': true};
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

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function reorderArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i].index = i+1;
    }
    return array;
}

function generateQuestion(q) {
    var answers = q.processed ? q.answers : processAnswers(q.answers);
    var html = '';
    var id = '';
    var answer = '';

    // console.log(challenge);
    // console.log(q);

    answers.choices = shuffleArray(answers.choices);

    html += '<b class="text-muted">Question ' + q['index'] + '</b>';
    html += '<h2>' + q.name + '</h2>';

    console.log(answers.choices);
        
    for (var ans in answers.choices) {
        // id = 'qstn-'+slugify(q.name)+'-answr-'+answers.choices[ans].slug+'';
        id = 'qstn-'+q['index']+'-answr-'+ans+'';
        answer = answers.choices[ans].name;
        if (answers.choices.length - answers.wrong > 1) {
            // multi choice
            html += '<div class="custom-control custom-checkbox">'
                +'<input type="checkbox" id="'+id+'" name="customCheckbox" class="custom-control-input">'
                +'<label class="custom-control-label" for="'+id+'">'+answer+'</label>'
            +'</div>';
        } else {
            // single choice
            html += '<div class="custom-control custom-radio">'
                +'<input type="radio" id="'+id+'" name="customRadio" class="custom-control-input">'
                +'<label class="custom-control-label" for="'+id+'">'+answer+'</label>'
            +'</div>';
        }
    }

    document.querySelector('.container').innerHTML = html;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


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

function slugify(st) {
    st = st.toLowerCase();
    st = st.replace(/[\u00C0-\u00C5]/ig,'a')
    st = st.replace(/[\u00C8-\u00CB]/ig,'e')
    st = st.replace(/[\u00CC-\u00CF]/ig,'i')
    st = st.replace(/[\u00D2-\u00D6]/ig,'o')
    st = st.replace(/[\u00D9-\u00DC]/ig,'u')
    st = st.replace(/[\u00D1]/ig,'n')
    st = st.replace(/[^a-z0-9 ]+/gi,'')
    st = st.trim().replace(/ /g,'-');
    st = st.replace(/[\-]{2}/g,'');
    return (st.replace(/[^a-z\- ]*/gi,''));
} 
function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.innerHTML = contents;
    var parts = contents.split('\n');

    // simple parser
    var question = {'processed': false};
    var line = '';
    var answer = '';
    var questionFound = false;
    var questionAdded = false;
    var n = 0;
    for (var i = 0; i < parts.length; i++) {
        line = parts[i].trim();
        if (line != '') {
            if (!question.answers) {
                question.answers = {};
                if (!question.answers.correct) {
                    question.answers.correct = {};
                }
                if (!question.answers.wrong) {
                    question.answers.wrong = {};
                }
            }
            
            // console.log(parts[i].trim().toLowerCase());
            switch(line[0]) {
                case '+':
                    answer = line.substr(1,).trim();
                    question.answers.correct[slugify(answer)] = answer;
                    break;
                case '-':
                    answer = line.substr(1,).trim();
                    question.answers.wrong[slugify(answer)] = answer;
                    break;
                case '{':

                    break;
                default:
                    
                    questionFound = true;

                    if (question.name) {
                        questions[n] = question;
                        question = {};
                        n++;
                    }
                    question.name = line;
                    // question.slug = slugify(line);
                    question.index = n;
                    question.processed = false;

                    if (questionFound && !questionAdded) {
                        questions[n] = question;
                        questionAdded = false;
                        // n++;
                    }
                    break;
            }
        }
    }

    // console.log(questions);
    questions = shuffleArray(questions);
    // console.log(questions);
    questions = reorderArray(questions);

    challenge = 0;
    limit = questions.length;

    // console.log(questions[challenge]);

    // generateQuestion(questions[challenge]);
    toggleElement('start');
}

function toggleElement(element) {
    var el = document.getElementById(element);
    // console.log(el.className);
    if (el.className.indexOf('hidden') != -1) {
        // console.log(el.className);
        // var parts = el.className.split(' ');
        // el.className.split(' ').push('visible').join(' ');
        el.className = el.className.replace('hidden', 'visible');
    } else {
        // el.style.display = 'none';
        // el.className.split(' ').push('visible').join(' ');
        el.className = el.className.replace('visible', 'hidden');
    }
}

function prevQuestion(event) {
    if (challenge > 0) {
        challenge--;
        generateQuestion(questions[challenge]);
        event.preventDefault();
    }
}
function nextQuestion(event) {
    if (challenge < limit-1) {
        challenge++;
        generateQuestion(questions[challenge]);
        event.preventDefault();
    }
    console.log(exam);
}
function startChallenge(event) {
    // generate first questions
    generateQuestion(questions[challenge]);
    // show nav buttons
    toggleElement('prev');
    toggleElement('next');
    // start timer
    timer();
    // start interval
    var displayTimer = setInterval(function() {
        time--;
        timer();
    }, 1000);
    event.preventDefault();
    toggleElement('start', 1000);
}

function registerAnswer(event) {
    if (event.target.getAttribute('id')) {
        var label = event.target.getAttribute('id');

        var question = label.split('qstn-')[1].split('-answr-')[0];
        var answer = label.split('-answr-')[1];

        // if (exam.questions
        exam.questions.push(question)
        console.log(question);
        console.log(answer);
    }
}

// var file = '/home/ash/Sites/codemarker/hr-questions.md';
   
document.getElementById('file-input').addEventListener('change', readSingleFile, false);

document.getElementById('prev').addEventListener('click', prevQuestion, false);
document.getElementById('next').addEventListener('click', nextQuestion, false);

document.getElementById('start').addEventListener('click', startChallenge, false);

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
}








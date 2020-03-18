'use strict'

var parser = {
    
    debug: true,

    question: {},
    
    questions: [],
    
    setup: null,
    
    line: '',
    
    answer: '',

    examName: '',
    
    paramsFound: false,

    answersFound: false,

    examConfig: {'all': 0, 'incomplete': 0},
    
    n: 0,

    errors: [],
    
    lengths: [],
    
    parse: function(content) {
        console.log('Parsing challenge questions has been started.');
        parser.debug ? console.log(content) : '';
        var parts = content.split('\n');
        for (var i = 0; i < parts.length; i++) {
            parser.line = parts[i].trim();
            if (parser.line != '') {
                parser.debug ? console.log(parser.line) : '';
                // init
                parser.question.name = parser.question.name || '';
                parser.question.length = parser.question.length || 0;
                parser.question.counter = parser.question.counter || {'correct': 0, 'wrong': 0};
                parser.question.processed = false;
    
                parser.question.params = parser.question.params || {};
    
                parser.question.answers = parser.question.answers || {};
                parser.question.answers.correct = parser.question.answers.correct || {};
                parser.question.answers.wrong = parser.question.answers.wrong || {};
                
                switch(parser.line[0]) {
                    case '+':
                        parser.answer = parser.line.substr(1,).trim();
                        parser.question.answers.correct[slugify(parser.answer)] = parser.answer;
                        parser.question.counter.correct++;
                        parser.question.length += parser.answer.length;
                        parser.answersFound = true;
                        break;
                    case '-':
                        parser.answer = parser.line.substr(1,).trim();
                        parser.question.answers.wrong[slugify(parser.answer)] = parser.answer;
                        parser.question.counter.wrong++;
                        parser.question.length += parser.answer.length;
                        parser.answersFound = true;
                        break;
                    case '{':
                        parser.question.params += parser.line;
                        parser.paramsFound = true;
                        if (parser.line.trim().substr(-1) == '}') {
                            parser.question.params = JSON.parse(parser.line);
                            parser.paramsFound = false;
                        }
                        break;
                    case '#':
                        parser.setup = parser.line.substr(1,).trim().split(':');
                        if (parser.setup.length > 1) {
                            // if (parser.setup[0] == 'exam') {
                            //     parser.examConfig['name'] = 'cm-' + parser.setup[1].trim();
                            // } else {
                                parser.examConfig[parser.setup[0]] = parser.setup[1].trim();
                            // }
                        }
                        break;
                    default:
                        if (parser.paramsFound) {
                            parser.question.params += parser.line;
                            if (parser.line.trim().substr(-1) == '}') {
                                console.log(parser.question.params);
                                parser.question.params = JSON.parse(parser.question.params);
                                parser.paramsFound = false;
                            }
                        } else {
                            if (parser.answersFound) {
                                if (!('type' in parser.question.params)) {
                                    parser.question.params.type = parser.question.counter.correct == 1 ? 'single' : 'multiple';
                                }
                                // no correct answers
                                if (parser.question.counter.correct == 0) {
                                    parser.question.params.status = 'incomplete';
                                    parser.examConfig.incomplete++;
                                }
                                parser.answersFound = false;
                                // adding found question to 
                                parser.questions[parser.n] = parser.question;
                                parser.lengths.push(parser.question.length);
                                // init new question
                                parser.question = {};
                                parser.question.name = '';
                                parser.question.length = 0;
                                parser.question.counter = {'correct': 0, 'wrong': 0};
                                parser.question.params = {};
                                parser.question.answers = {};
                                parser.question.answers.correct = {};
                                parser.question.answers.wrong = {};
                                parser.n++;
                            }
                            parser.question.name += '<p>' + parser.line + '</p>';
                            parser.question.length += parser.line.length;
                            parser.question.index = parser.n;
                        }
                        break;
                }
            }
        }
        parser.questions[parser.n] = parser.question;
        parser.examConfig.all = parser.questions.length;
        parser.debug ? console.log(parser) : '';
        // setup dafault for exam config if such missing in file
        if (!('exam' in parser.examConfig)) {
            parser.examConfig.exam = 'sample-exam';
            parser.errors.push('Name of exam has been set to <strong>'+parser.examConfig.exam+'</strong>, because <strong>exam</strong> param was missing in file.');
        }
        if (!('questions' in parser.examConfig)) {
            parser.examConfig.questions = parser.questions.length;
            parser.errors.push('All available '+parser.examConfig.questions+' questions have been used for exam. If want other value then set <strong>questions</strong> param in file.');
        }
        if (!('duration' in parser.examConfig)) {
            parser.examConfig.duration = parser.examConfig.questions * 2;
            parser.errors.push('Duration has been calculated to <strong>'+parser.examConfig.duration+'</strong>, because <strong>duration</strong> param was missing in file.');
        }
        if (!('pass' in parser.examConfig)) {
            parser.examConfig.pass = 80;
            parser.errors.push('Passing threshold of exam has been set to <strong>'+parser.examConfig.pass+'%</strong>, because <strong>pass</strong> param was missing in file.');
        }
        if (!('description' in parser.examConfig)) {
            parser.examConfig.description = 'Exam description has been generated automatically. If you want to change this text then add <strong>description</strong> param in file.';
            parser.errors.push('Description of exam was missing in file.');
        }
        console.log(parser.examConfig);
        console.log('Parsing challenge questions has been ended.');
    }
}

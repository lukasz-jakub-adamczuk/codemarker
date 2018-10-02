'use strict'

var parser = {
    
    question: {},
    
    questions: [],
    
    setup: null,
    
    line: '',
    
    answer: '',

    exam: '',
    
    paramsFound: false,

    initialSetup: {},
    
    n: 0,
    
    lengths: [],
    
    parse: function(content) {
        console.log(content);
        var parts = content.split('\n');
        for (var i = 0; i < parts.length; i++) {
            parser.line = parts[i].trim();
            if (parser.line != '') {
                // init
                parser.question.length = parser.question.length || 0;
                parser.question.processed = false;
    
                parser.question.params = parser.question.params || {};
    
                parser.question.answers = parser.question.answers || {};
                parser.question.answers.correct = parser.question.answers.correct || {};
                parser.question.answers.wrong = parser.question.answers.wrong || {};
                
                switch(parser.line[0]) {
                    case '+':
                        parser.answer = parser.line.substr(1,).trim();
                        parser.question.answers.correct[slugify(parser.answer)] = parser.answer;
                        parser.question.length += parser.answer.length;
                        break;
                    case '-':
                        parser.answer = parser.line.substr(1,).trim();
                        parser.question.answers.wrong[slugify(parser.answer)] = parser.answer;
                        parser.question.length += parser.answer.length;
                        break;
                    case '{':
                        parser.question.params += parser.line;
                        parser.paramsFound = true;
                        if (parser.line.trim().substr(-1) == '}') {
                            console.log(parser.line);
                            parser.question.params = JSON.parse(parser.line);
                            parser.paramsFound = false;
                        }
                        break;
                    case '#':
                        parser.setup = parser.line.substr(1,).trim().split(':');
                        if (parser.setup.length > 1) {
                            if (parser.setup[0] == 'exam') {
                                parser.exam = 'cm-' + parser.setup[1].trim();
                                parser.initialSetup[parser.exam] = {};
                                parser.initialSetup[parser.exam].name = parser.setup[1].trim();
                            } else {
                                parser.initialSetup[parser.exam][parser.setup[0]] = parser.setup[1].trim();
                            }
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
                            if (parser.question.name) {
                                parser.questions[parser.n] = parser.question;
                                parser.lengths.push(parser.question.length);
                                parser.question = {};
                                
                                parser.question.length = 0;
                                parser.n++;
                            }
                            parser.question.name = parser.line;
                            parser.question.length += parser.line.length;
                            parser.question.index = parser.n;
                        }
                        break;
                }
            }
        }
        parser.questions[parser.n] = parser.question;
    }
}

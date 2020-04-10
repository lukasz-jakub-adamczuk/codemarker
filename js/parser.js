'use strict'

var Parser = {
    
    init: function() {
        this.debug = true;
        this.question = {};        
        this.questions = [];        
        this.setup = null;        
        this.line = '';
        this.params = '';        
        this.answer = '';
        this.examName = '';        
        this.paramsFound = false;
        this.answersFound = false;
        this.examConfig = {'all': 0, 'ignored': 0};        
        this.n = 0;
        this.errors = [];        
        this.lengths = [];
    },
    
    parse: function(content) {
        console.log('Parsing challenge questions has been started.');
        this.debug ? console.log(content) : '';
        var parts = content.split('\n');
        for (var i = 0; i < parts.length; i++) {
            this.line = parts[i].trim();
            if (this.line != '') {
                this.debug ? console.log(this.line) : '';
                // init
                this.params = this.params || '';

                this.question.name = this.question.name || '';
                this.question.length = this.question.length || 0;
                this.question.counter = this.question.counter || {'correct': 0, 'wrong': 0};
                this.question.processed = false;
    
                this.question.params = this.question.params || {};
    
                this.question.answers = this.question.answers || [];
                // this.question.answers.correct = this.question.answers.correct || {};
                // this.question.answers.wrong = this.question.answers.wrong || {};
                
                switch(this.line[0]) {
                    case '+':
                        this.answer = this.line.substr(1,).trim();
                        this.question.answers.push({'type': 'correct', 'slug': slugify(this.answer), 'name': this.answer});
                        // this.question.answers.correct[slugify(this.answer)] = this.answer;
                        this.question.counter.correct++;
                        this.question.length += this.answer.length;
                        this.answersFound = true;
                        break;
                    case '-':
                        this.answer = this.line.substr(1,).trim();
                        this.question.answers.push({'type': 'wrong', 'slug': slugify(this.answer), 'name': this.answer});
                        // this.question.answers.wrong[slugify(this.answer)] = this.answer;
                        this.question.counter.wrong++;
                        this.question.length += this.answer.length;
                        this.answersFound = true;
                        break;
                    case '{':
                        this.params += this.line;
                        this.paramsFound = true;
                        if (this.line.trim().substr(-1) == '}') {
                            // this.question.params = this.line;
                            this.question.params = JSON.parse(this.params);
                            this.debug ? console.log('Exam params before and after parsing:') : '';
                            this.debug ? console.log(this.params) : '';
                            this.debug ? console.log(this.question.params) : '';
                            this.paramsFound = false;
                            this.params = '';
                        }
                        break;
                    case '#':
                        this.setup = this.line.substr(1,).trim().split(':');
                        if (this.setup.length > 1) {
                            // if (this.setup[0] == 'exam') {
                            //     this.examConfig['name'] = 'cm-' + this.setup[1].trim();
                            // } else {
                                this.examConfig[this.setup[0]] = this.setup[1].trim();
                            // }
                        }
                        break;
                    default:
                        if (this.paramsFound) {
                            this.params += this.line;
                            if (this.line.trim().substr(-1) == '}') {
                                this.question.params = JSON.parse(this.params);
                                this.debug ? console.log('Exam params before and after parsing:') : '';
                                this.debug ? console.log(this.params) : '';
                                this.debug ? console.log(this.question.params) : '';
                                this.paramsFound = false;
                                this.params = '';
                            }
                        } else {
                            if (this.answersFound) {
                                if (!('type' in this.question.params)) {
                                    this.question.params.type = this.question.counter.correct == 1 ? 'single' : 'multiple';
                                }
                                // no correct answers
                                if (this.question.counter.correct == 0) {
                                    this.question.params.status = 'ignored';
                                }
                                if (this.question.params.status == 'ignored') {
                                    this.examConfig.ignored++;
                                }
                                this.answersFound = false;
                                // adding found question to 
                                this.questions[this.n] = this.question;
                                this.lengths.push(this.question.length);
                                // init new question
                                this.question = {};
                                this.question.name = '';
                                this.question.length = 0;
                                this.question.counter = {'correct': 0, 'wrong': 0};
                                this.question.params = {};
                                this.question.answers = [];
                                // this.question.answers.correct = {};
                                // this.question.answers.wrong = {};
                                this.n++;
                            }
                            // this.question.name += '<p>' + this.line + '</p>';
                            this.question.name += this.line + "\n\n";
                            this.question.length += this.line.length;
                            this.question.index = this.n;
                        }
                        break;
                }
            }
        }
        // this actions needs to be done for last question because during loop parsing
        // have been skipped as last line of question is answer and each question
        // is added to list when next is found
        if (!('type' in this.question.params)) {
            this.question.params.type = this.question.counter.correct == 1 ? 'single' : 'multiple';
        }
        // no correct answers
        if (this.question.counter.correct == 0) {
            this.question.params.status = 'ignored';
        }
        if (this.question.params.status == 'ignored') {
            this.examConfig.ignored++;
        }
        this.questions[this.n] = this.question;
        this.examConfig.all = this.questions.length;
        this.debug ? console.log(this) : '';
        // setup dafault for exam config if such missing in file
        if (!('exam' in this.examConfig)) {
            this.examConfig.exam = 'sample-exam';
            this.errors.push('Name of exam has been set to <strong>'+this.examConfig.exam+'</strong>, because <strong>exam</strong> param was missing in file.');
        }
        if (!('questions' in this.examConfig)) {
            this.examConfig.questions = this.questions.length;
            this.errors.push('All available '+this.examConfig.questions+' questions have been used for exam. If want other value then set <strong>questions</strong> param in file.');
        }
        if (!('duration' in this.examConfig)) {
            this.examConfig.duration = this.examConfig.questions * 2;
            this.errors.push('Duration has been calculated to <strong>'+this.examConfig.duration+'</strong>, because <strong>duration</strong> param was missing in file.');
        }
        if (!('pass' in this.examConfig)) {
            this.examConfig.pass = 80;
            this.errors.push('Passing threshold of exam has been set to <strong>'+this.examConfig.pass+'%</strong>, because <strong>pass</strong> param was missing in file.');
        }
        if (!('description' in this.examConfig)) {
            this.examConfig.description = 'Exam description has been generated automatically. If you want to change this text then add <strong>description</strong> param in file.';
            this.errors.push('Description of exam was missing in file.');
        }
        console.log(this.examConfig);
        console.log('Parsing challenge questions has been ended.');
    }
}

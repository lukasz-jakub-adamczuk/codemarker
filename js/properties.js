'use strict'

var properties = {};

var propertiesSetup = {
    'challenges': {
        'label': 'Challenges',
        'opts': [
            {
                'name': 'quiz.questions.shuffle',
                'label': 'Shuffle questions',
                'value': true
            }, {
                'name': 'quiz.answers.shuffle',
                'label': 'Shuffle available answers',
                'value': true
            }
        ]
    },
    'app': {
        'label': 'Application and UI',
        'opts': [
            {
                'name': 'app.ui.introduction_enabled',
                'label': 'Watch introdution everytime.',
                'value': true
            },{
                'name': 'app.ui.start_challenge_after_load_success',
                'label': 'Start challenge after successfully loading questions from file. Print mode cannot be used.',
                'value': false
            },{
                'name': 'app.ui.start_challenge_after_selecting',
                'label': 'Start challenge after selecting. Print mode cannot be used.',
                'value': false
            },{
                'name': 'app.ui.display_progress',
                'label': 'Display progress bar during challenge.',
                'value': true
            },{
                'name': 'app.ui.display_timer',
                'label': 'Display time during challenge.',
                'value': true
            }
        ]
    },
    'print': {
        'label': 'Print mode',
        'opts': [
            {
                'name': 'print.questions.skip_incomplete',
                'label': 'Skip incomplete questions',
                'value': true
            },{
                'name': 'print.answers.print_incorrect',
                'label': 'Print incorrect answers',
                'value': false
            },
        ]
    }
};

// Handle creating list of available properties
function initProperties(setup) {
    for (var section in setup) {
        if (setup[section].opts.length) {
            for (var p in setup[section].opts) {
                properties[setup[section].opts[p].name] = setup[section].opts[p].value;
            }
        }
    }
}

// Handle rendering list of available properties
function renderProperties(setup) {
    // print available exams
    var html = '';
    if (!('localStorage' in window)) {
        html += '<div class="alert alert-warning" role="alert">Changing options is disabled, because your browser does not support localStorage.</div>';
    }
    for (var section in setup) {
        if (setup[section].opts.length) {
            html += '<p class="opts-header">' + setup[section].label + '</p>';
            html += '<div class="list-group">';
            for (var p in setup[section].opts) {
                html += prepareProperty(setup[section].opts[p]);
            }
            html += '</div>';
        }
    }
    renderElement('#app-properties', html);
}

// Internal function to handle single property rendering
function prepareProperty(property) {
    var disabled = 'localStorage' in window ? '' : ' disabled';
    var html = '<span id="prop-' + property.name + '" class="list-group-item list-group-item-action flex-column align-items-start">'
        // + '<p class="mb-1">' + property.label + '</p>'
        + '<div class="custom-control custom-switch">'
        + '<input type="checkbox" class="custom-control-input" id="' + property.name + '"' + (properties[property.name] ? 'checked' : '') + disabled + '>'
        + '<label class="custom-control-label" for="' + property.name + '">' + property.label + '</label>'
        + '</div>'
            + '</span>';
    return html;
}

// Handle changing value of property
function manageProperty(event) {
    var name = event.target.getAttribute('id');
    
    if (name) {
        properties[name] = event.target.checked;
        console.log('Application property [' + name + '] has been changed.');
        if ('localStorage' in window) {
            localStorage.setItem('properties', JSON.stringify(properties));
        }
    }
}
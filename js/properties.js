'use strict'

var properties = {};

var propertiesSetup = {
    'challenges': {
        'label': 'Challenges',
        'opts': [
            {
                'name': 'quiz_questions_shuffle',
                'label': 'Shuffle questions.',
                'value': false
            }, {
                'name': 'quiz_answers_shuffle',
                'label': 'Shuffle available answers.',
                'value': true
            }, {
                'name': 'quiz_answers_print_letters',
                'label': 'Display letters before answers.',
                'value': false,
                'state': 'disabled'
            }, {
                'name': 'quiz_answers_help_button',
                'label': 'Allow using Help button during challenges.',
                'value': true
            }, {
                'name': 'quiz_questions_skip_ignored',
                'label': 'Skip invalid or marked as ignored questions.',
                'value': true
            }
        ]
    },
    'app': {
        'label': 'Application and UI',
        'opts': [
            {
                'name': 'app_ui_introduction_enabled',
                'label': 'Watch introdution everytime.',
                'value': true
            },{
                'name': 'app_ui_animation_before_result',
                'label': 'Watch animation before displaying exam result.',
                'value': true
            },{
                'name': 'app_ui_start_challenge_after_load_success',
                'label': 'Start challenge after successfully loading questions from file. Print mode cannot be used.',
                'value': false
            },{
                'name': 'app_ui_start_challenge_after_download_success',
                'label': 'Start challenge after successfully downloading questions from internet. Print mode cannot be used.',
                'value': false
            },{
                'name': 'app_ui_start_challenge_after_selecting',
                'label': 'Start challenge after selecting. Print mode cannot be used.',
                'value': false
            },{
                'name': 'app_ui_display_progress',
                'label': 'Display progress bar during challenge.',
                'value': true
            },{
                'name': 'app_ui_display_timer',
                'label': 'Display time during challenge.',
                'value': true
            }
        ]
    },
    'print': {
        'label': 'Print mode',
        'opts': [
            {
                'name': 'print_questions.skip_ignore_',
                'label': 'Skip invalid or marked as ignored questions.',
                'value': true
            },{
                'name': 'print_answers.print_incorrec_',
                'label': 'Print incorrect (less visible) answers',
                'value': false
            }
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
        html += '<div class="alert alert-warning mb-2" role="alert">Changing options is disabled, because your browser does not support localStorage.</div>';
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
    disabled = 'state' in property && property.state == 'disabled' ? ' disabled' : disabled;
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
    console.log('manageProperty() has been used.');
    
    var node = event.target;
    while (node.tagName.toLowerCase() != 'span') {
        node = node.parentNode;
    }
    var name = node.getAttribute('id').substring(5);

    if (name) {
        console.log(name);
        properties[name] = document.querySelector('#'+name).checked;
        console.log('Application property [' + name + '] has been set to [' + properties[name] + '] value.');
        if ('localStorage' in window) {
            localStorage.setItem('properties', JSON.stringify(properties));
        }
    }
}

// Handle changing value of property
function resetAllSettings(event) {
    console.log('resetAllSettings() has been used.');

    var html = '';
    if ('localStorage' in window) {
        removeLocalStorageItem('properties');
        html += '<div class="alert alert-info mb-2" role="alert">Current settings has been reset.</div>';
    } else {
        html += '<div class="alert alert-warning mb-2" role="alert">Current settings cannot back to default, because your browser does not support localStorage.</div>';
    }
    renderElement('.settings-messages', html);

    // set local version
    if ('localStorage' in window) {
        setLocalStorageItem('learnwise', LW_VERSION, false);
        $('#version strong')[0].textContent = LW_VERSION;
        html = '<div class="alert alert-info mb-2" role="alert">Your version is up-to-date.</div>';
    }
    renderElement('.version-messages', html);
}
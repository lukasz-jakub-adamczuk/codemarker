'use strict'

var properties = {};

console.log('1. ' + properties.app_ui_language);

// init properties with default values
initProperties(propertiesSetup);

console.log('2. ' + properties.app_ui_language);

if ('localStorage' in window) {
    if (localStorage.getItem('properties')) {
        var locales = JSON.parse(localStorage.getItem('properties'));
        for (var prop in locales) {
            properties[prop] = locales[prop];
        }
    }
}

console.log('3. ' + properties.app_ui_language);

var propertiesSetup = {
    'app': {
        'label': 'Application',
        'opts': [
            {
                'name': 'app_ui_language',
                'label': 'Preferred language.',
                'hint': '',
                'values': {
                    'en': getMessage('lang_en', 'English'),
                    'pl': getMessage('lang_pl', 'Polish')
                },
                'value': 'en',
                'new_feature': true
            }, {
                'name': 'app_ui_theme',
                'label': 'Preferred theme.',
                'hint': '',
                'values': {
                    'light': getMessage('theme_light', 'Light'),
                    'dark': getMessage('theme_dark', 'Dark'),
                    'gold': getMessage('theme_gold', 'Gold')
                },
                'value': 'light',
                'new_feature': true
            }, {
                'name': 'app_ui_annotations',
                'label': 'Display annotations.',
                'hint': 'This option controls annotations in user preferences.',
                'value': true,
                'new_feature': true
            }, {
                'name': 'app_ui_introduction_enabled',
                'label': 'Watch introduction.<span class="badge badge-primary>New</span>',
                'hint': 'This option controls animation when application is starting.',
                'value': true
            }, {
                'name': 'app_ui_animation_before_result',
                'label': 'Watch animation before displaying exam result.',
                'hint': 'This option controls animation before exam result presenting.',
                'value': true
            }, {
                'name': 'app_ui_start_challenge_after_load_success',
                'label': 'Start challenge after loading questions.',
                'hint': 'This option starts challenge right after exam has been loaded from file. Print mode cannot be used.',
                'value': false
            }, {
                'name': 'app_ui_start_challenge_after_download_success',
                'label': 'Start challenge after downloading questions.',
                'hint': 'This option starts challenge right after exam has been downloaded from internet. Print mode cannot be used.',
                'value': false
            }, {
                'name': 'app_ui_start_challenge_after_selecting',
                'label': 'Start challenge after selecting.',
                'hint': 'This option starts challenge right after selection from list without additional use Start button on bottom navigation. Print mode cannot be used.',
                'value': false
            }
        ]
    },
    'ui': {
        'labeld': 'User interface',
        'opts': [
            {
                'name': 'quiz_questions_mark_for_review',
                'label': 'Allow marking questions for review during challenge.',
                'hint': 'This option allows to mark question which can be reviewed before submitting exam.',
                'value': false
            }, {
                'name': 'app_ui_display_nav_below_questions',
                'label': 'Display additional navigation below questions during challenge.',
                'hint': 'This option allows to display additional navigation for previous and next question if available.',
                'value': false
            }, {
                'name': 'quiz_answers_help_button',
                'label': 'Allow using Help button during challenge.',
                'hint': 'This option allow to use Help button placed on bottom navigation.',
                'value': true
            }, {
                'name': 'quiz_answers_print_letters',
                'label': 'Display letters before answers.',
                'hint': 'This option displays additional letters for before answers.',
                'value': false,
                'state': 'enabled'
            }, {
                'name': 'app_ui_display_progress',
                'label': 'Display progress bar during challenge.',
                'hint': 'This option displays progress bar on top.',
                'value': true
            }, {
                'name': 'app_ui_display_timer',
                'label': 'Display timer during challenge.',
                'hint': 'This option displays timer defined for exam or right equivalent for all available questions.',
                'value': true
            }
        ]
    },
    'challenges': {
        'label': 'Challenge mode',
        'opts': [
            {
                'name': 'quiz_questions_shuffle',
                'label': 'Shuffle questions.',
                'hint': 'This option allows to shuffle questions used in quiz. Quiz refresh required.',
                'value': false
            }, {
                'name': 'quiz_answers_shuffle',
                'label': 'Shuffle available answers.',
                'hint': 'This option allows to shuffle answers appearence order. Quiz refresh required.',
                'value': true
            }, {
                'name': 'quiz_questions_use_all',
                'label': 'Use all available questions.',
                'hint': 'This option allows to use all available questions regardless limit set for challenge. Using invalid or ignored questions is controlled by other property.',
                'value': false
            }, {
                'name': 'quiz_questions_skip_ignored',
                'label': 'Skip invalid/ignored questions.',
                'hint': 'This option allows to skip invalid/ignored questions, so such which have no correct answer or answers at all.',
                'value': true
            }, {
                'name': 'quiz_auto_restoration',
                'label': 'Auto-restoring saved exam.',
                'hint': 'This option all to restore interrupted challenge. You will back automatically to started challenge when open LearnWise again.',
                'value': false
            }
        ]
    },
    'print': {
        'label': 'Print mode',
        'opts': [
            {
                'name': 'print_questions_skip_ignored',
                'label': 'Skip invalid or marked as ignored questions.',
                'hint': 'This option will not print questions ',
                'value': true
            }, {
                'name': 'print_answers_print_incorrect',
                'label': 'Print incorrect (less visible) answers',
                'hint': 'This option prints incorrect answers, but less visible.',
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
        html += warning(getMessage('msg_options_change_disabled', 'Changing options is disabled, because your browser does not support localStorage.'));
    }
    for (var section in setup) {
        if (setup[section].opts.length) {
            html += '<p class="opts-header">' + getMessage(section + '_label', setup[section].label) + '</p>';
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
function getProperty(propertyName, defaultValue) {
    if (propertyName in properties) {
        return properties[propertyName];
    }
    return defaultValue;
}

// Internal function to handle single property rendering
function prepareProperty(property) {
    if ((getLocalStorageItem('learnwise', false) != LW_VERSION) && (property.new_feature || property.new_feature == true)) {
        return '';
    }
    var disabled = 'localStorage' in window ? '' : ' disabled';
    disabled = 'state' in property && property.state == 'disabled' ? ' disabled' : disabled;
    var html = '<span id="prop-' + property.name + '" class="list-group-item list-group-item-action flex-column align-items-start">';
        // + '<p class="mb-1">' + property.label + '</p>'
        
    if ('values' in property) {
        html += prepareChoiceProperty(property, disabled);
        html += preparePropertyErrors(property);
    } else {
        html += '<div class="custom-control custom-switch">'
        + prepareTrueFalseProperty(property, disabled)
        html += preparePropertyErrors(property);
        html += '</div>'
    }
    html += '</span>';
    return html;
}

// Internal function to handle single property rendering
function prepareChoiceProperty(property, disabled) {
    var selected;
    var html = '';
    if ('values' in property) {
        html += '<select class="app-settings-control-choice" id="' + property.name + '"' + disabled + '>';
        for (var val in property.values) {
            selected = (val == properties[property.name] ? 'selected' : '');
            html += '<option value="' + val + '"' + selected + '>' + property.values[val] + '</option>';
        }
        html += '</select>';
    }
    html += preparePropertyLabel(property);
    html += preparePropertyHint(property);
    return html;
}

// Internal function to handle single property rendering
function prepareTrueFalseProperty(property, disabled) {
    var html = '';
    html += '<input type="checkbox" class="custom-control-input" id="' + property.name + '"' + (properties[property.name] ? 'checked' : '') + disabled + '>';
    html += preparePropertyLabel(property, 'custom-control-label');
    html += preparePropertyHint(property);
    return html;
}

// Internal function to handle single property rendering
function preparePropertyLabel(property, className) {
    className = className ? ' class="' + className + '"' : '';
    // className = 'class="custom-control-label"';
    var html = '';
    html += '<label' + className+ ' for="' + property.name + '">' + getMessage(property.name + '_label', property.label) + '</label>';
    html += ('new_feature' in property) ? ' <span class="badge badge-primary">' + getMessage('new_feature', 'New feature') + '</span>' : '';
    return html;
}

// Internal function to handle single property rendering
function preparePropertyHint(property) {
    if (properties.app_ui_annotations) {
        var html = '';
            // + (property.hint ? info('<small>' + getMessage(property.name + '_hint', property.hint) + '</small>') : '')
        html += (property.hint ? info('' + getMessage(property.name + '_hint', property.hint) + '') : '');
            // + '';
        return html;
    }
    return '';
}

// Internal function to handle single property rendering
function preparePropertyErrors(property) {
    var html = '<div id="prop-' + property.name + '-errors">'
        + (property.name in properties ? '' : warning(getMessage('msg_prop_not_detected', 'Property value not detected locally. Use switch to set correct value or Reset all settings.')))
        + '</div>'
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

    // console.warn(name);

    if (name) {
        var elem = document.querySelector('#'+name);
        if (elem.tagName.toLowerCase() == 'input') {
            properties[name] = elem.checked;
        }
        if (elem.tagName.toLowerCase() == 'select') {
            properties[name] = elem.value;
        }
        // console.log(name);
        // console.log(document.querySelector('#'+name));
        // console.log(document.querySelector('#'+name).value);
        
        
        console.log('Application property [' + name + '] has been set to [' + properties[name] + '] value.');
        // if ('localStorage' in window) {
        //     localStorage.setItem('properties', JSON.stringify(properties));
        // }
        setLocalStorageItem('properties', properties);
    }
    var html = (name in properties ? '' : warning(getMessage('msg_prop_not_detected', 'Property value not detected locally. Use switch to set correct value or Reset all settings.')));

    renderElement('#'+node.getAttribute('id')+'-errors', html);
}

// Handle changing value of property
function resetAllSettings(event) {
    console.log('resetAllSettings() has been used.');

    var html = '';
    if ('localStorage' in window) {
        removeLocalStorageItem('properties');
        initProperties(propertiesSetup);
        setLocalStorageItem('properties', properties);
        renderProperties(propertiesSetup);
        html += info(getMessage('msg_options_has_been_reset', 'Current settings has been reset.'));
    } else {
        html += warning(getMessage('msg_options_reset_disabled', 'Current settings cannot be reset, because your browser does not support localStorage.'));
    }
    renderElement('.settings-messages', html);

    // set local version
    if ('localStorage' in window) {
        setLocalStorageItem('learnwise', LW_VERSION, false);
        document.querySelectorAll('#version strong').textContent = LW_VERSION;
        html = info(getMessage('msg_version_up_to_date', 'Your version is up-to-date.'));
    }
    renderElement('.version-messages', html);
}
'use strict'

var Properties = (function() {
    'use strict';

    var list = {};

    function get(name) {
        if (name in list) {
            return list[name].getValue();
        }
    };

    function set(name, value) {
        if (name in list) {
            return list[name].setValue(value);
        }
    };

    function init(setup) {
        for (var section in setup) {
            if (setup[section].opts.length) {
                for (var prop in setup[section].opts) {
                    list[setup[section].opts[prop].name] = new Property(setup[section].opts[prop]);
                }
            }
        }
    };

    function render(setup) {
        var html = '';
        if (!('localStorage' in window)) {
            html += '<div class="alert alert-warning mb-2" role="alert">Changing options is disabled, because your browser does not support localStorage.</div>';
        }
        for (var section in setup) {
            if (setup[section].opts.length) {
                html += '<p class="opts-header">' + setup[section].label + '</p>';
                html += '<div class="list-group">';
                for (var prop in setup[section].opts) {
                    html += list[setup[section].opts[prop].name].prepare();
                }
                html += '</div>';
            }
        }
        renderElement('#app-properties', html);
    }

    return {
        get: get,
        set: set,
        init: init,
        render: render
    };
})();


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
        + '<div id="prop-' + property.name + '-errors">'
        + (property.name in properties ? '' : '<div class="alert alert-warning mb-2" role="alert">Property value not detected locally. Use switch to set correct value or Reset all settings.</div>')
        + '</div>'
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
    var html = (name in properties ? '' : '<div class="alert alert-warning mb-2" role="alert">Property value not detected locally. Use switch to set correct value or Reset all settings.</div>');

    renderElement('#'+node.getAttribute('id')+'-errors', html);
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
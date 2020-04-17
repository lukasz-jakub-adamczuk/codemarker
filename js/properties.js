'use strict'

// import {Property} from './property.js';

var Properties = (function() {
    'use strict';

    var list = {};

    function items() {
        return list;
    };

    function has(name) {
        return name in list;
    };

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

    function sync(properties) {
        if (properties) {
            for (var prop in properties) {
                list[prop] = new Property(properties[prop]);
            }
        }
    };

    // Handle rendering list of available properties
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
        items: items,
        has: has,
        get: get,
        set: set,
        init: init,
        sync: sync,
        render: render
    };
})();


// export {Properties};


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
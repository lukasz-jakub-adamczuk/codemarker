'use strict'

// var translations = {};

var translations = {
    'en': translationsInEnglish,
    'pl': translationsInPolish
};

function getMessage(key, message, params, useMarked) {
    // var lang = getProperty('app_ui_language', 'en');
    var lang = properties.app_ui_language || 'en';
    // console.log(lang);
    message = translations[lang][key] || message;
    // params might me used in message ${1} ${2}
    if (params) {
        // var message = 'Use this option to load questions from your computer or mobile. File content must be in ${format} to be ${parsed} with application.';

        // console.log(message);

        // placeholder
        const regex = /(\${\w*})/gm;
        
        var found = message.match(regex);

        if (found) {
            for (var item in found) {
                var placeholderRegex = /(\w+)/gm;
                var placeholder = found[item].match(placeholderRegex);
                var placeholderPhrase = params[item].replace('${}', placeholder[0]);

                message = message.replace(found[item], placeholderPhrase);
            }
        }

        // variables
        const variableRegex = /(%d)/gm;

        var varFound = message.match(variableRegex);

        if (varFound) {
            // console.log('var found');
            for (var p in params) {
                message = message.replace('%d', params[p]);
            }
        }
    }
    if (useMarked) {
        return marked(message);
    }
    return message;
}

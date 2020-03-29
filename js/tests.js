'use strict'


var testChallengeResult = function() {
    showElement('.result');
    hideElement('#exams');

    finishChallenge();

    runSpinner('renderExamResult');
}

// testChallengeResult();
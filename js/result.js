'use strict';

// Handle rendering result of finished challenge
function renderExamResult() {
    console.log('renderExamResult() has been used.');
    
    hideElements(['challenge', 'progress', 'timer']);
    
    showElement('.result');


    var summary = validateExamAnswers();
    var score = summary.score;
    var title;
    var subtitle;
    var image;

    var html = '';

    subtitle = getMessage('result_score', 'Your score is ${score}.', ['<strong>'+score+'%</strong>']) + ' ';

    if (score == 100) {
        title = getMessage('result_perfect', 'Perfect');
        subtitle += getMessage('result_perfect_details', 'Will you repeat this?');
        image = 'passed';
    }
    if (score >= 80 && score < 100) {
        title = getMessage('result_great', 'Great');
        subtitle += getMessage('result_great_details', 'You would pass exam.');
        image = 'passed';
    }
    if (score >= 50 && score < 80) {
        title = getMessage('result_not_good', 'Not good');
        subtitle += getMessage('result_not_good_details', 'You can do it better.');
        image = 'failed';
    }
    if (score < 50) {
        title = getMessage('result_poor', 'Poor');
        subtitle += getMessage('result_poor_details', 'You have to do it better.');
        image = 'failed';
    }
    if (score == 0) {
        title = getMessage('result_terrible', 'Terrible');
        subtitle += getMessage('result_terrible_details', 'Start to learn wise.');
        image = 'epic-fail';
    }

    html += '<div class="row">';
    html += '<div class="col mb-3">';
    html += '<div class="card text-center result-box">';
    // html += '<div class="card text-center col-sm-6 col-md-6  col-lg-8  col-xl-12">';
    html += '   <div class="card-header">';
    // html +=  allExams[exam].exam.toUpperCase() + ' exam result';
    html +=  getMessage('exam_result_header', '${name} exam result', [allExams[exam].description]);
    // html +=  ' Service Mapping exam result';
    html += '   </div>';
    html += '   <a href="#" onclick="javascript:renderExamResultDetails();">';
    html += '       <div class="card-body">';
    html += '           <div class="col-sm-6 result-image '+image+'"></div>';
    html += '           <h1 class="card-title">'+title+'</h1>';
    html += '           <p class="card-text">'+subtitle.replace('%d%', '<strong>'+score+'%</strong>')+'</p>';
    // html += '<a href="#" class="btn btn-primary">Go somewhere</a>';
    html += '       </div>';
    html += '   </a>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row row-cols-1 row-cols-md-2">';
    html += '    <div class="col mb-3 col-sm-6 col-md-6">';
    html += '        <div class="card h-100 text-center text-success border-success result-box">';
    html += '            <a href="#" onclick="javascript:renderExamResultDetails(\'correct\');">';
    html += '                <div class="card-body">';
    html += '                    <h1 class="card-title">'+summary.correct.length+'</h1>';
    html += '                    <p class="card-text">' + getMessage('exam_result_correct', 'Questions answered correctly.') + '</p>';
    html += '                </div>';
    html += '            </a>';
    html += '        </div>';
    html += '    </div>';
    html += '    <div class="col mb-3 col-sm-6 col-md-6">';
    html += '        <div class="card h-100 text-center text-danger border-danger result-box">';
    html += '            <a href="#" onclick="javascript:renderExamResultDetails(\'wrong\');">';
    html += '                <div class="card-body">';
    html += '                    <h1 class="card-title">'+summary.wrong.length+'</h1>';
    html += '                    <p class="card-text">' + getMessage('exam_result_incorrect', 'Questions with incorrect or missing answer.') + '</p>';
    html += '                </div>';
    html += '            </a>';
    html += '        </div>';
    html += '    </div>';
    html += '</div>';

    // html += '<div class="row">';
    // html += '    <div class="col text-center mt-3 mb-3">';
    // html += '<button id="repeat-exam" onclick="javascript:repeatExam();" class="btn btn-secondary">Repeat same questions</button>';
    // html += '<button id="retry-exam" onclick="javascript:retryExam();" class="btn btn-primary">Retry new questions</button>';
    // html += '    </div>';
    // html += '</div>';

    html += '<div class="row row-cols-1 row-cols-md-2">';
    html += '    <div class="col text-center mb-3 col-sm-6 col-md-6">';
    html += '        <button id="retry-exam" onclick="javascript:retryExam();" class="btn btn-primary">' + getMessage('retry_exam', 'Retry new questions') + '</button>';
    html += '    </div>';
    html += '    <div class="col text-center mb-3 col-sm-6 col-md-6">';
    html += '        <button id="repeat-exam" onclick="javascript:repeatExam();" class="btn btn-secondary">' + getMessage('repeat_exam', 'Repeat same questions') + '</button>';
    html += '    </div>';
    html += '</div>';
    

    // renderElement('.result', result + '<p class="advice">' + advice + '</p>' + html);
    renderElement('.result', html);

    state = 'exam_result_rendered';
}

// Handle rendering result of finished challenge
function renderExamResultDetails(type) {
    console.log('renderExamResultDetails() has been used.');
    
    hideElements(['challenge', 'progress', 'timer']);
    
    showElement('.result');


    var summary = validateExamAnswers();
    var className;
    var list = questions.answered;
    
    var html = '';

    html += '<div class="row">';
    html += '    <div class="col mb-3">';
    html += '        <div class="list-group mb-3">';
    list.forEach(function(item, i) {
        className = item == 'correct' ? 'success' : 'danger';
        if (!type || type == 'common') {
            html += '<a href="#" onclick="javascript:backToChallenge('+(i-1)+', \'result\', \'common\');" class="list-group-item list-group-item-action list-group-item-'+className+'">'+replaceBBCode(questions.used[i-1].name)+'</a>';
        } else {
            if (type == item) {
                html += '<a href="#" onclick="javascript:backToChallenge('+(i-1)+', \'result\', \''+item+'\');" class="list-group-item list-group-item-action list-group-item-'+className+'">'+replaceBBCode(questions.used[i-1].name)+'</a>';
            }
        }
    });
    if (type == 'correct' || type == 'wrong') {
        var answered = type == 'correct' ? 'correctly' : 'incorrectly';
        var message = 'Questions answered ' + answered + ' not found.';
        if (summary[type].length == 0) {
            html += '<div class="alert alert-warning mb-2" role="alert">' + message + '</div>';
        }
    }
    html += '    </div>';

    html += '    <div class="col text-center mb-3">';
    html += '        <button id="exam-results" onclick="javascript:renderExamResult();" class="btn btn-secondary">' + getMessage('back_to_result', 'Back to exam result') + '</button>';
    html += '    </div>';
    html += '</div>';

    html += '</div>';

    
    // renderElement('.result', result + '<p class="advice">' + advice + '</p>' + html);
    renderElement('.result', html);

    state = 'exam_result_rendered';
}

function backToExamResult() {
    // hideElements(['result']);

    // generateQuestion(questions.used[id], parseInt(id));

    // showElements(['challenge']);
}

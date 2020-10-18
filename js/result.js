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

    if (score == 100) {
        title = 'Perfect';
        subtitle = 'Your score is %d%. Will you repeat this?';
        image = 'passed';
    }
    if (score >= 80 && score < 100) {
        title = 'Great';
        subtitle = 'Your score is %d%. You would pass exam.';
        image = 'passed';
    }
    if (score >= 50 && score < 80) {
        title = 'Not good';
        subtitle = 'Your score is %d%. You can do it better.';
        image = 'failed';
    }
    if (score < 50) {
        title = 'Poor';
        subtitle = 'Your score is %d%. You have to do it better.';
        image = 'failed';
    }
    if (score == 0) {
        title = 'Terrible';
        subtitle = 'Your score is %d%. Start to learn wise.';
        image = 'epic-fail';
    }


    html += '<div class="row">';
    html += '<div class="col mb-3">';
    html += '<div class="card text-center">';
    // html += '<div class="card text-center col-sm-6 col-md-6  col-lg-8  col-xl-12">';
    html += '   <div class="card-header">';
    html +=  allExams[exam].exam.toUpperCase() + ' exam result';
    // html +=  ' Service Mapping exam result';
    html += '   </div>';
    html += '            <a href="#" onclick="javascript:renderExamResultDetails();">';
    html += '       <div class="card-body">';
    
    html += '           <img src="./img/'+image+'.png" class="col-sm-6">';
    html += '           <h1 class="card-title">'+title+'</h1>';
    html += '           <p class="card-text">'+subtitle.replace('%d%', '<strong>'+score+'%</strong>')+'</p>';
    // html += '<a href="#" class="btn btn-primary">Go somewhere</a>';
    
    html += '       </div>';
    html += '            </a>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="row row-cols-1 row-cols-md-2">';
    html += '    <div class="col mb-3 col-sm-6 col-md-6">';
    html += '        <div class="card h-100 text-center text-success border-success">';
    html += '            <a href="#" onclick="javascript:renderExamResultDetails(\'correct\');">';
    html += '                <div class="card-body">';
    html += '                    <h1 class="card-title">'+summary.correct.length+'</h1>';
    html += '                    <p class="card-text">Questions answered correctly.</p>';
    html += '                </div>';
    html += '            </a>';
    html += '        </div>';
    html += '    </div>';
    html += '    <div class="col mb-3 col-sm-6 col-md-6">';
    html += '        <div class="card h-100 text-center text-danger border-danger">';
    html += '            <a href="#" onclick="javascript:renderExamResultDetails(\'wrong\');">';
    html += '                <div class="card-body">';
    html += '                    <h1 class="card-title">'+summary.wrong.length+'</h1>';
    html += '                    <p class="card-text">Questions with incorrect or missing answer.</p>';
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
    html += '        <button id="retry-exam" onclick="javascript:retryExam();" class="btn btn-primary">Retry new questions</button>';
    html += '    </div>';
    html += '    <div class="col text-center mb-3 col-sm-6 col-md-6">';
    html += '        <button id="repeat-exam" onclick="javascript:repeatExam();" class="btn btn-secondary">Repeat same questions</button>';
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

    html += '<div class="list-group">';
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
    
    html += '<div class="row">';
    html += '    <div class="col text-center mt-3 mb-3">';
    html += '        <button id="exam-results" onclick="javascript:renderExamResult();" class="btn btn-secondary">Back to exam result</button>';
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

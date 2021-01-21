'use script';


const LW_VERSION            = '0.14';
const PROP_VERSION          = '0.07';

if (window.location.host == 'localhost') {
    var CS_INDEX_URL      = 'http://localhost/sites/cloud-server/index.php';
    var CS_PARSER_URL     = 'http://localhost/sites/cloud-server/parse.php';
} else {
    var CS_INDEX_URL      = 'https://ash.unixstorm.org/codemarker/cloud/index.php';
    var CS_PARSER_URL     = 'https://ash.unixstorm.org/codemarker/cloud/parse.php';
}

var version;

var codeMarker = {};

var state;

var questions = {
    'all': [],
    'used': [],
    'exam': [],
    'ignored': [],
    'marked': [],
    'answered': []
};
var challenge;
var limit;
var displayTimer;
var saverTimer;

var displayTimerElement;

var keyEventEnabled = false;

// var initialSetup = {};
var allExams = {};
var allFilters = {};
var examsHashes = {};
var availableExams = [];

var errors = [];

var exam;
var time;

var stats;
var mapping = {};

var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

var goodFeedback = new Audio('./audio/bravo.mp3');
var badFeedback = new Audio('./audio/buzzer.mp3');

// var timePromise;
// var answersPromise;

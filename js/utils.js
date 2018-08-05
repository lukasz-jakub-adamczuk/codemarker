
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function reorderArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i].index = i+1;
        // array[i].processed = true;
    }
    return array;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(st) {
    st = st.toLowerCase();
    st = st.replace(/[\u00C0-\u00C5]/ig,'a')
    st = st.replace(/[\u00C8-\u00CB]/ig,'e')
    st = st.replace(/[\u00CC-\u00CF]/ig,'i')
    st = st.replace(/[\u00D2-\u00D6]/ig,'o')
    st = st.replace(/[\u00D9-\u00DC]/ig,'u')
    st = st.replace(/[\u00D1]/ig,'n')
    st = st.replace(/[^a-z0-9 ]+/gi,'')
    st = st.trim().replace(/ /g,'-');
    st = st.replace(/[\-]{2}/g,'');
    return (st.replace(/[^a-z0-9\- ]*/gi,''));
}

function toggleElement(element) {
    var el = document.getElementById(element);
    if (el.className.indexOf('hidden') != -1) {
        el.className = el.className.replace('hidden', 'visible');
    } else {
        el.className = el.className.replace('visible', 'hidden');
    }
}

function showElement(element) {
    var el = document.getElementById(element);
    el.className = el.className.replace('hidden', 'visible');
}

function hideElement(element) {
    var el = document.getElementById(element);
    el.className = el.className.replace('visible', 'hidden');
}
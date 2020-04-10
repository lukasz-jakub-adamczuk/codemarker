'use strict'

// function Property(name, label, value) {
//     this.name = name;
//     this.label = label;
//     this.value = value;
// }
function Property(params) {
    this.name = params.name;
    this.label = params.label;
    this.value = params.value;
    this.state = params.state;
}
Property.prototype.getValue = function() {
    return this.value;
}
Property.manage = function(event) {
    console.log('Poperty.manage() has been used.');
    
    var node = event.target;
    while (node.tagName.toLowerCase() != 'span') {
        node = node.parentNode;
    }
    var name = node.getAttribute('id').substring(5);

    if (name) {
        console.log(name);
        Properties.set(name, document.querySelector('#'+name).checked);
        setLocalStorageItem(name, Properties, true);
        console.log('Application property [' + name + '] has been set to [' + Properties.set(name) + '] value.');

    }
    var html = (name in properties ? '' : '<div class="alert alert-warning mb-2" role="alert">Property value not detected locally. Use switch to set correct value or Reset all settings.</div>');

    renderElement('#'+node.getAttribute('id')+'-errors', html);
}
Property.prototype.prepare = function() {
    console.log('Poperty.prepare() has been used.');
    var disabled = 'localStorage' in window ? '' : ' disabled';
    disabled = 'state' in this && this.state == 'disabled' ? ' disabled' : disabled;
    var html = '<span id="prop-' + this.name + '" class="list-group-item list-group-item-action flex-column align-items-start">'
        // + '<p class="mb-1">' + this.label + '</p>'
        + '<div class="custom-control custom-switch">'
        + '<input type="checkbox" class="custom-control-input" id="' + this.name + '"' + (properties[this.name] ? 'checked' : '') + disabled + '>'
        + '<label class="custom-control-label" for="' + this.name + '">' + this.label + '</label>'
        + '<div id="prop-' + this.name + '-errors">'
        + (this.name in properties ? '' : '<div class="alert alert-warning mb-2" role="alert">Property value not detected locally. Use switch to set correct value or Reset all settings.</div>')
        + '</div>'
        + '</div>'
        + '</span>';
    return html;
}

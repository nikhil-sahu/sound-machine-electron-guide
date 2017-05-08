'use strict';

var electron = require('electron');

var ipc = electron.ipcRenderer;


var soundButtons = document.querySelectorAll('.button-sound');
var closeEl = document.querySelector('.close');
var settingsEl = document.querySelector('.settings');


for (var i = 0; i < soundButtons.length; i++) {
    var soundButton = soundButtons[i];
    var soundName = soundButton.attributes['data-sound'].value;

    prepareButton(soundButton, soundName);
}

function prepareButton(buttonEl, soundName) {
    buttonEl.querySelector('span').style.backgroundImage = 'url("img/icons/' + soundName + '.png")';

    var audio = new Audio(__dirname + '/wav/' + soundName + '.wav');
    buttonEl.addEventListener('click', function () {
        audio.currentTime = 0;
        audio.play();
    });
}

closeEl.addEventListener('click', function () {
    ipc.send('close-main-window');
});

settingsEl.addEventListener('click', function () {
    ipc.send('open-settings-window');
});

ipc.on('global-shortcut', function (arg) {
    var event = new MouseEvent('click');
    soundButtons[arg].dispatchEvent(event);
});

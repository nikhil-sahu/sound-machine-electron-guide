'use strict';
const electron = require('electron');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var configuration = require('./configuration');
var ipc = electron.ipcMain;

var usb = require('usb');

var mainWindow = null;


app.on('ready', function () {
    if (!configuration.readSettings('shortcutKeys')) {
        configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    }

    mainWindow = new BrowserWindow({
        frame: false,
        height: 700,
        resizable: false,
        width: 368
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    setGlobalShortcuts();

    addMenu();

    testUsb();
});

function setGlobalShortcuts() {
    globalShortcut.unregisterAll();

    var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
    var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

    globalShortcut.register(shortcutPrefix + '1', function () {
        mainWindow.webContents.send('global-shortcut', 0);
    });
    globalShortcut.register(shortcutPrefix + '2', function () {
        mainWindow.webContents.send('global-shortcut', 1);
    });
}

function closeMainWindow() {
    app.quit();
}

ipc.on('close-main-window', closeMainWindow);

let settingsWindow = null;
function openSettingsWindow() {

    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        frame: false,
        height: 200,
        resizable: false,
        width: 200
    });

    settingsWindow.loadURL('file://' + __dirname + '/app/settings.html');

    settingsWindow.on('closed', function () {
        settingsWindow = null;
    });
}

function closeSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.close();
    }
}

ipc.on('open-settings-window', openSettingsWindow);
ipc.on('close-settings-window', closeSettingsWindow);

ipc.on('set-global-shortcuts', setGlobalShortcuts);

var trayIcon = null;
var trayMenu = null;
var Tray = electron.Tray;
var Menu = electron.Menu;
var path = require('path');

function addMenu() {

    if (process.platform === 'darwin') {
        trayIcon = new Tray(path.join(__dirname, 'app/img/tray-iconTemplate.png'));
    }
    else {
        trayIcon = new Tray(path.join(__dirname, 'app/img/tray-icon-alt.png'));
    }

    var trayMenuTemplate = [
        {
            label: 'Sound machine',
            enabled: false
        },
        {
            label: 'Settings',
            click: openSettingsWindow
        },
        {
            label: 'Quit',
            click: closeMainWindow
        }
    ];
    trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    trayIcon.setContextMenu(trayMenu);
}

function testUsb() {

    console.log(usb.getDeviceList());

}

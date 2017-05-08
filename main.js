'use strict';
const electron = require('electron');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var configuration = require('./configuration');
var ipc = electron.ipcMain;

var mainWindow = null;
var settingsWindow = null;

app.on('ready', function() {
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

ipc.on('close-main-window', function () {
    app.quit();
});

ipc.on('open-settings-window', function () {
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
});

ipc.on('close-settings-window', function () {
    if (settingsWindow) {
        settingsWindow.close();
    }
});

ipc.on('set-global-shortcuts', function () {
    setGlobalShortcuts();
});

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
            click: function () {
                ipc.send('open-settings-window');
            }
        },
        {
            label: 'Quit',
            click: function () {
                ipc.send('close-main-window');
            }
        }
    ];
    trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    trayIcon.setContextMenu(trayMenu);

}

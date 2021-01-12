import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { isProduction } from '../common/Utils';

const injWindowConfig: Electron.BrowserWindowConstructorOptions = {
    width: 1280,
    height: 720,
    title: 'Krunker',
    show: false,
    webPreferences: {
        contextIsolation: true
    }
};

const windowConfig: Electron.BrowserWindowConstructorOptions = {
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    title: 'KrunkerWSInspector',
    show: false,
    webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
    }
};

const openInjWindow = (): BrowserWindow => {
    const injWin = new BrowserWindow(injWindowConfig);
    if (isProduction()) {
        injWin.setMenu(null);
    } else {
        injWin.setMenuBarVisibility(false);
        injWin.webContents.openDevTools({ mode: 'detach' });
        injWin.webContents.addListener('devtools-opened', () => injWin.focus());
    }

    injWin.webContents.setUserAgent(injWin.webContents.userAgent.replace(/Electron.*/, ''));

    injWin.on('ready-to-show', injWin.show);

    injWin.loadURL('https://krunker.io')
        .then(() => injWin.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, './injection.bundle.js')).toString()))
        .catch(console.error);

    return injWin;
};

app.once('ready', () => {
    let injWin = openInjWindow();

    const win = new BrowserWindow(windowConfig);
    if (isProduction()) {
        win.setMenu(null);
    } else {
        win.setMenuBarVisibility(false);
        win.webContents.openDevTools({ mode: 'detach' });
        win.webContents.addListener('devtools-opened', () => win.focus());
    }

    win.on('ready-to-show', win.show);
    win.on('close', app.exit.bind(this, 0));

    win.loadFile(path.join(__dirname, './renderer/index.html'))
        .catch(console.error);

    ipcMain.on('reopen-window', () => {
        if (!injWin.isDestroyed()) {
            injWin.close();
        }
        injWin = openInjWindow();
    });
});

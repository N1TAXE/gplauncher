import {app, shell, BrowserWindow, ipcMain, dialog} from 'electron'
import {join} from 'path'
import {electronApp, optimizer, is} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as path from "path";
import { store } from './store'
import { autoUpdater } from 'electron-updater'
import 'dotenv/config'
import log from 'electron-log'
import { getOpts } from './utils'
import { Launcher } from './core/launcher'

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

log.initialize();

let mainWindow: BrowserWindow
let launcher: Launcher
function createMainWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 320,
        height: 480,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        resizable: false,
        ...(process.platform === 'linux' ? {icon} : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: true,
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {action: 'deny'}
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('gpmc', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('gpmc')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
    app.whenReady().then(() => {
        if (!store.get('lang')) {
            store.set('lang', app.getLocale())
        }

        electronApp.setAppUserModelId('com.electron')
        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })

        launcher = new Launcher();

        ipcCommands()
        launcherCommands()
        debug()

        createMainWindow()

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
        })

        ipcMain.on('launcher:getUpdates', async () => {
            if (is.dev) {
                mainWindow.webContents.send('launcher:updateNotAvailable')
            } else {
                await autoUpdater.checkForUpdates();
            }
        })
    })
}

autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('launcher:checkingForUpdate')
})
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('launcher:updateAvailable')
    autoUpdater.downloadUpdate();
})
autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('launcher:updateNotAvailable')
})
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('launcher:updateDownloaded')
    autoUpdater.quitAndInstall()
})
autoUpdater.on('error', (error) => {
    console.error('Ошибка обновления:', error.message)
})

autoUpdater.on('update-cancelled', () => {
    mainWindow.webContents.send('launcher:updateCancelled')
})

function ipcCommands(): void {
    ipcMain.on('launcher:updateConfig', async (_e, data) => {
        store.set(data.item, data.value)
    })
    ipcMain.on('launcher:getStore', async () => {
        mainWindow.webContents.send('launcher:getStore', store.store)
    })
    ipcMain.on('launcher:download', async () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.setOptions(opts);
            launcher.launch().then(() => {
                mainWindow.webContents.send('launcher:started')
                mainWindow.minimize()
            }).catch((e) => log.error(e))
        })
    })
    ipcMain.on('launcher:downloadServer', async () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.downloadServer(...opts).then(() => mainWindow.webContents.send('launcher:closed')).catch((e) => log.error(e))
        })
    })
    ipcMain.on('launcher:checkInstance', () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.checkIfVersionDownloaded(...opts).then((isDownloaded) => {
                mainWindow.webContents.send('launcher:checkInstance', isDownloaded)
            })
        })
    })

    ipcMain.on('app:close', () => {
        app.quit()
    })
    ipcMain.on('app:minimize', () => {
        mainWindow.minimize()
    })
    ipcMain.on('app:changeGameRoot', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'], // указываем, что мы хотим выбрать папку
            title: 'Выберите папку', // заголовок диалога
        });

        if (result.filePaths[0] && result.filePaths[0] != undefined) {
            store.set('gameRoot', result.filePaths[0])
            event.sender.send('app:gameRootChanged', result.filePaths[0]);
        }
    });
    ipcMain.on('app:changeRam', async (_e, data) => {
        store.set('memoryMax', data)
    });
}

function launcherCommands():void {
    launcher.on('download-status', (info) => {
        mainWindow.webContents.send('launcher:download', info)
    })
    launcher.on('close', () => {
        mainWindow.webContents.send('launcher:closed')
    })
}

function debug(): void {
    launcher.on('debug', (info) => {
        log.info(info)
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

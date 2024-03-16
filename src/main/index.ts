import {app, shell, BrowserWindow, ipcMain, dialog} from 'electron'
import {join} from 'path'
import {electronApp, optimizer, is} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as path from "path";
import { Client, Authenticator, ILauncherOptions, DistTypes } from 'gpl-core'
import { store } from './store'
import { autoUpdater } from 'electron-updater'
import 'dotenv/config'

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow: BrowserWindow
let launcher: Client
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
    mainWindow.webContents.openDevTools();

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
    app.on('second-instance', (_event, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
        // the commandLine is array of strings in which last element is deep link url
        dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`)
    })
    app.whenReady().then(() => {
        electronApp.setAppUserModelId('com.electron')
        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })

        launcher = new Client();

        handleCommands()

        createMainWindow()

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
        })

        autoUpdater.checkForUpdates();
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
autoUpdater.on('update-cancelled', () => {
    console.log('test')
})
autoUpdater.on('error', (error) => {
    console.error('Ошибка обновления:', error.message)
})

autoUpdater.on('update-cancelled', () => {
    mainWindow.webContents.send('launcher:updateCancelled')
})

function handleCommands(): void {
    ipcMain.on('launcher:setNickname', async (_e, data) => {
        store.set('username', data)
    })
    ipcMain.on('launcher:getStore', async () => {
        mainWindow.webContents.send('launcher:getStore', store.store)
    })
    ipcMain.on('launcher:download', async () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.launch(...opts).then(() => {
                mainWindow.webContents.send('launcher:started')
                mainWindow.minimize()
            }).catch((e) => console.log(e))
        })
    })
    ipcMain.on('launcher:downloadServer', async () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.downloadServer(...opts).then(() => mainWindow.webContents.send('launcher:closed')).catch((e) => console.log(e))
        })
    })
    ipcMain.on('launcher:get', () => {
        getOpts().then((opts) => {
            if (!opts) return;
            launcher.checkIfVersionDownloaded(...opts).then((isDownloaded) => {
                mainWindow.webContents.send('launcher:get', isDownloaded)
            })
        })
    })
    ipcMain.on('launcher:setGameRoot', (_e, data) => {
        store.set('gameRoot', data)
    })

    launcher.on('download-status', (info) => {
        mainWindow.webContents.send('launcher:download', info)
    })
    launcher.on('close', () => {
        mainWindow.webContents.send('launcher:closed')
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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

async function getOpts(): Promise<[ILauncherOptions, DistTypes] | undefined> {
    const url = 'https://gist.githubusercontent.com/N1TAXE/6384e1f556e3f76241c0b5c02a1fd4cd/raw/manifest.json'
    let dist: DistTypes | undefined
    await fetch(url)
        .then(response => response.json())
        .then(data => {
            dist = data
        });
    if (!dist) return;
    store.set('dist', dist)
    return [{
        authorization: Authenticator.getAuth(store.get('username')),
        root: store.get('gameRoot') || `./minecraft`,
        version: {
            number: dist.version,
            type: "release"
        },
        memory: {
            max: `${store.get('memoryMax')}M` || '6000M',
            min: `${store.get('memoryMin')}M` || '4000M'
        },
        forge: dist.forge,
        overrides: {
            gameDirectory: `${store.get('gameRoot')}/versions/${dist.name}` || `./minecraft/versions/${dist.name}`,
            fw: {
                version: '1.6.0'
            },
            detached: false
        }
    }, dist]
}

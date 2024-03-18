import React, { ChangeEvent, useEffect, useState } from 'react'
import { formatBytes } from '../utils/utils'
import axios from 'axios'
import { DownloadDataTypes, ServerTypes, StoreTypes } from '../../../types'
import { CircularProgressbar } from 'react-circular-progressbar';
import { Input } from '../components/Input'
import Checkbox from '@renderer/components/Checkbox';
import Preloader from '../components/Preloader'
import { useTranslation } from 'react-i18next'
const MainPage = (): React.ReactElement => {
    const {t} = useTranslation()

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [store, setStore] = useState<StoreTypes | null>(null);
    const [status, setStatus] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [quickPlay, setQuickPlay] = useState<boolean>(false);

    const [server, setServer] = useState<ServerTypes | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<DownloadDataTypes>();
    const [percent, setPercent] = useState<number>(0);

    const ipcRenderer = window.electron.ipcRenderer;
    const ipcHandle = (): void => {
        setStatus('gamePreparing')
        ipcRenderer.send('launcher:download')
    }

    const getServer = async (): Promise<void> => {
        if (!store) return;
        axios.get('https://mcapi.us/server/status', {
            params: {
                ip: store.dist.server.address,
                port: store.dist.server.port
            }
        }).then((data) => {
                setServer(data.data)
            })
    }

    useEffect(() => {
        if (downloadStatus) {
            setPercent((downloadStatus.current / downloadStatus.total) * 100)
        }
    }, [downloadStatus])

    useEffect(() => {
        getServer();
        const pingServer = setInterval(getServer, 10000)
        return () => clearInterval(pingServer)
    }, [store])

    useEffect(() => {
        ipcRenderer.send('launcher:checkInstance')
        ipcRenderer.send('launcher:getStore')
        const handleCheckInstance = (_event, data): void => {
            if (data) {
                setStatus('gamePlay');
            } else {
                setStatus('gameInstall');
            }
        };
        const handleDownloadStatus = (_event, data): void => {
            setDownloadStatus(data);
            setStatus('gameUpdating');
        };
        const handleLauncherStarted = (): void => {
            setStatus('gameStarted');
        };
        const handleLauncherClosed = (): void => {
            setStatus('gamePlay');
        };
        const handleStore = (_e, data): void => {
            if (data) {
                setUsername(data.username)
                setQuickPlay(data.quickPlay)
                setStore(data)
            }
        };

        ipcRenderer.on('launcher:checkInstance', handleCheckInstance);
        ipcRenderer.on('launcher:getStore', handleStore);
        ipcRenderer.on('launcher:download', handleDownloadStatus);
        ipcRenderer.on('launcher:started', handleLauncherStarted);
        ipcRenderer.on('launcher:closed', handleLauncherClosed);

        return () => {
            ipcRenderer.removeAllListeners('launcher:get');
            ipcRenderer.removeAllListeners('launcher:started');
            ipcRenderer.removeAllListeners('launcher:closed');
        };
    }, []);

    const handleUsername = (e: ChangeEvent<HTMLInputElement>): void => {
        setUsername(e.target.value)
        ipcRenderer.send('launcher:updateConfig', {item: 'username', value: e.target.value})
    }

    const handleQuickPlay = (e: ChangeEvent<HTMLInputElement>): void => {
        setQuickPlay(e.target.checked)
        ipcRenderer.send('launcher:updateConfig', {item: 'quickPlay', value: e.target.checked})
    }

    const handleDownloadServer = (): void => {
        ipcRenderer.send('launcher:downloadServer')
    }

    useEffect(() => {
        if (store && status && isLoading) {
            setIsLoading(false)
        }
    }, [status, isLoading, store])

    if (isLoading) return <Preloader/>

    return (
        <React.Fragment>
            <div className='serverWrapper'>
                <div className="server">
                    <div className='serverName'>
                        GPServer
                    </div>
                    <div className="serverStatus">
                        <svg className={`serverStatusDot ${server ? (server.online ? 'online' : 'offline') : 'offline'}`} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="4" cy="4" r="4" fill="inherit"/>
                        </svg>
                        {server?.online ? `${server && server.players.now} / ${server && server.players.max}`: 'Offline'}
                    </div>
                    <button onClick={handleDownloadServer} className="serverInstall">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.40466 1.05039C8.99186 -0.350129 7.00814 -0.350128 6.59534 1.05039L6.49523 1.39003C6.23147 2.2849 5.20935 2.70827 4.39008 2.26201L4.07913 2.09264C2.79692 1.39422 1.39422 2.79693 2.09264 4.07913L2.26201 4.39008C2.70827 5.20935 2.2849 6.23147 1.39003 6.49523L1.05039 6.59534C-0.350129 7.00814 -0.350128 8.99186 1.05039 9.40466L1.39003 9.50477C2.2849 9.76853 2.70827 10.7906 2.26201 11.6099L2.09264 11.9209C1.39422 13.2031 2.79692 14.6058 4.07913 13.9074L4.39008 13.738C5.20935 13.2917 6.23147 13.7151 6.49523 14.61L6.59534 14.9496C7.00814 16.3501 8.99186 16.3501 9.40466 14.9496L9.50477 14.61C9.76853 13.7151 10.7906 13.2917 11.6099 13.738L11.9209 13.9074C13.2031 14.6058 14.6058 13.2031 13.9074 11.9209L13.738 11.6099C13.2917 10.7906 13.7151 9.76853 14.61 9.50477L14.9496 9.40466C16.3501 8.99186 16.3501 7.00814 14.9496 6.59534L14.61 6.49523C13.7151 6.23147 13.2917 5.20935 13.738 4.39008L13.9074 4.07913C14.6058 2.79692 13.2031 1.39422 11.9209 2.09264L11.6099 2.26201C10.7906 2.70827 9.76853 2.2849 9.50477 1.39003L9.40466 1.05039ZM8 10.9288C6.38246 10.9288 5.07119 9.61754 5.07119 8C5.07119 6.38246 6.38246 5.07119 8 5.07119C9.61754 5.07119 10.9288 6.38246 10.9288 8C10.9288 9.61754 9.61754 10.9288 8 10.9288Z" fill="inherit"/>
                        </svg>
                    </button>
                </div>
                <Checkbox name="quickPlay" checked={quickPlay} onChange={handleQuickPlay}>{t("ln_gameQuickPlay")}</Checkbox>
            </div>
            {(status === t(`ln_gameAssets`) && downloadStatus) && (
                <div className='downloader'>
                    <div className='downloaderInfo'>
                        <span>{downloadStatus?.type === 'assets' ? t(`ln_gameAssets`) : downloadStatus?.name}</span>
                        <h4>{formatBytes(downloadStatus.current)} / {formatBytes(downloadStatus.total)}</h4>
                    </div>
                    <CircularProgressbar value={percent} />
                </div>
            )}
            <div className='main-buttons'>
                <Input type='text' placeholder={t(`ln_ph_nickname`)} value={username} onChange={(e) => handleUsername(e)} />
                <button disabled={status === 'gameUpdating' || status === 'gameStarted' || status === 'gamePreparing'} className="btn btn-md btn-success" onClick={ipcHandle}>
                    {t(`ln_${status}`)}
                </button>
            </div>
        </React.Fragment>
    )
}

export default MainPage

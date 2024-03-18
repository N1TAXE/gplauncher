import React, { ChangeEvent, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MAIN_ROUTE } from '../utils/consts'
import { Input } from '../components/Input'
import { StoreTypes } from '../../../types'
import Checkbox from '../components/Checkbox'
import Preloader from '../components/Preloader'
import { useTranslation } from 'react-i18next'

const SettingsPage = (): React.ReactElement => {
    const {t, i18n} = useTranslation()
    const ipcRenderer = window.electron.ipcRenderer;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [ram, setRam] = useState<number>(0);
    const [gameWindow, setGameWindow] = useState<{fullscreen: boolean; windowW: number; windowH: number;}>({fullscreen: false, windowW: 856, windowH: 482});

    const changeLang = (lang): void => {
        i18n.changeLanguage(lang).then(() => {
            ipcRenderer.send('launcher:updateConfig', {item: 'lang', value: lang})
        })
    }
    const handleFolderSelect = (): void => ipcRenderer.send('app:changeGameRoot');
    const handleRamChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setRam(Number(e.target.value))
        ipcRenderer.send('launcher:updateConfig', {item: 'memoryMax', value: Number(e.target.value)})
    };

    const handleFullScreenChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setGameWindow(prevState => (prevState && {
            fullscreen: e.target.checked,
            windowW: prevState.windowW,
            windowH: prevState.windowH
        }));
        ipcRenderer.send('launcher:updateConfig', {item: 'fullscreen', value: e.target.checked})
    };
    const handleWindowChange = (e: ChangeEvent<HTMLInputElement>, isWidth: boolean): void => {
        setGameWindow(prevState => (prevState && {
            fullscreen: prevState.fullscreen,
            windowW: isWidth ? Number(e.target.value) : prevState.windowW,
            windowH: !isWidth ? Number(e.target.value) : prevState.windowH,
        }));
        ipcRenderer.send('launcher:updateConfig', {item: isWidth ? 'windowW' : 'windowH', value: Number(e.target.value)})
    };

    const handleFolder = (data: string): void => {
        if (data) {
            setSelectedFolder(data)
            ipcRenderer.send('launcher:updateConfig', {item: 'gameRoot', value: data})
        }
    };
    useEffect(() => {
        ipcRenderer.send('launcher:getStore')
        const handleStore = (_e, data: StoreTypes): void => {
            if (data) {
                setSelectedFolder(data.gameRoot)
                setRam(data.memoryMax)
                setGameWindow({fullscreen: data.fullscreen, windowW: data.windowW, windowH: data.windowH})
            }
        };
        const handleFolderSelected = (_e, data): void => {
            if (data) {
                setSelectedFolder(data)
            }
        };
        ipcRenderer.on('launcher:getStore', handleStore);
        ipcRenderer.on('app:gameRootChanged', handleFolderSelected);
    }, [])

    useEffect(() => {
        if (selectedFolder && ram) {
            setIsLoading(false)
        }
    }, [selectedFolder, isLoading, ram])

    if (isLoading) return <Preloader/>

    return (
        <div className="settings">
            <NavLink className="btn-back" to={MAIN_ROUTE}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15 8.5C15 8.22386 14.7761 8 14.5 8L2.70711 8L5.85355 4.85355C6.04882 4.65829 6.04882 4.34171 5.85355 4.14645C5.65829 3.95118 5.34171 3.95118 5.14645 4.14645L1.14645 8.14645C0.951184 8.34171 0.951184 8.65829 1.14645 8.85355L5.14645 12.8536C5.34171 13.0488 5.65829 13.0488 5.85355 12.8536C6.04882 12.6583 6.04882 12.3417 5.85355 12.1464L2.70711 9H14.5C14.7761 9 15 8.77614 15 8.5Z" fill="inherit"/>
                </svg>
                {t("ln_back")}
            </NavLink>
            <Input onChange={(e) => handleFolder(e.target.value)} value={selectedFolder} label={t("ln_dir")} name="gameRoot" type="text" placeholder={t("ln_ph_value")}>
                <button onClick={handleFolderSelect}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.2 8.844C14.7584 8.844 14.4 8.508 14.4 8.094V5.25C14.4 4.561 13.8016 4 13.0667 4H7.3216C7.0784 4 6.84907 3.896 6.6976 3.719L6.0544 2.967C5.80053 2.67 5.4208 2.5 5.0144 2.5H2.93333C2.1984 2.5 1.6 3.061 1.6 3.75V7.75C1.6 8.164 1.2416 8.5 0.8 8.5C0.3584 8.5 0 8.164 0 7.75V3.75C0 2.234 1.3152 1 2.93333 1H5.0144C5.90827 1 6.7424 1.375 7.3024 2.029L7.7056 2.5H13.0667C14.6848 2.5 16 3.734 16 5.25V8.094C16 8.508 15.6416 8.844 15.2 8.844Z" fill="inherit"/>
                        <path d="M13.0667 5H2.93333C1.3133 5 0 6.23122 0 7.75V12.25C0 13.7688 1.3133 15 2.93333 15H13.0667C14.6867 15 16 13.7688 16 12.25V7.75C16 6.23122 14.6867 5 13.0667 5Z" fill="inherit"/>
                    </svg>
                </button>
            </Input>
            <Input onChange={handleRamChange} value={ram} label={t("ln_ram")} name="ram" type="number" placeholder={t("ln_ph_value")}/>
            <div className='inputGroup'>
                <Input className={gameWindow.fullscreen ? "disabled" : undefined} disabled={gameWindow?.fullscreen} onChange={(e) => handleWindowChange(e, true)} value={gameWindow?.windowW} label={t("ln_screenWidth")} name="windowW" type="number" placeholder={t("ln_ph_value")}/>
                <Input className={gameWindow.fullscreen ? "disabled" : undefined} disabled={gameWindow?.fullscreen} onChange={(e) => handleWindowChange(e, false)} value={gameWindow?.windowH} label={t("ln_screenHeight")} name="windowH" type="number" placeholder={t("ln_ph_value")}/>
            </div>
            <Checkbox name="fullscreen" checked={gameWindow.fullscreen} onChange={handleFullScreenChange}>{t("ln_fullscreen")}</Checkbox>
            <div className='inputGroup'>
                <button className="btn btn-md btn-success" onClick={() => changeLang("en")}>
                    EN
                </button>
                <button className="btn btn-md btn-success" onClick={() => changeLang("ru")}>
                    RU
                </button>
            </div>
        </div>
    )
}
export default SettingsPage

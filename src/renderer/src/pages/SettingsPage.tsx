import React, { ChangeEvent, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MAIN_ROUTE } from '../utils/consts'
import { Input } from '../components/Input'
import { StoreTypes } from '../../../types'
import Checkbox from '../components/Checkbox'
const SettingsPage = (): React.ReactElement => {
    const ipcRenderer = window.electron.ipcRenderer;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [ram, setRam] = useState<number>(0);
    const [gameWindow, setGameWindow] = useState<{fullscreen: boolean; windowW: number; windowH: number;}>({fullscreen: false, windowW: 856, windowH: 482});
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
                setIsLoading(false)
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
    if (isLoading) return <div>Loading...</div>
    return (
        <div className="settings">
            <NavLink className="btn-back" to={MAIN_ROUTE}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15 8.5C15 8.22386 14.7761 8 14.5 8L2.70711 8L5.85355 4.85355C6.04882 4.65829 6.04882 4.34171 5.85355 4.14645C5.65829 3.95118 5.34171 3.95118 5.14645 4.14645L1.14645 8.14645C0.951184 8.34171 0.951184 8.65829 1.14645 8.85355L5.14645 12.8536C5.34171 13.0488 5.65829 13.0488 5.85355 12.8536C6.04882 12.6583 6.04882 12.3417 5.85355 12.1464L2.70711 9H14.5C14.7761 9 15 8.77614 15 8.5Z" fill="inherit"/>
                </svg>
                Вернуться
            </NavLink>
            <Input onChange={(e) => handleFolder(e.target.value)} value={selectedFolder} label="Директория" name="gameRoot" type="text" placeholder="Ввeдите директорию для игры">
                <button onClick={handleFolderSelect}>Обзор</button>
            </Input>
            <Input onChange={handleRamChange} value={ram} label="Оперативная память" name="ram" type="number" placeholder="Введите значение"/>
            <div className='inputGroup'>
                <Input className={gameWindow.fullscreen ? "disabled" : undefined} disabled={gameWindow?.fullscreen} onChange={(e) => handleWindowChange(e, true)} value={gameWindow?.windowW} label="Ширина окна игры" name="windowW" type="number" placeholder="Введите значение"/>
                <Input className={gameWindow.fullscreen ? "disabled" : undefined} disabled={gameWindow?.fullscreen} onChange={(e) => handleWindowChange(e, false)} value={gameWindow?.windowH} label="Высота окна игры" name="windowH" type="number" placeholder="Введите значение"/>
            </div>
            <Checkbox name="fullscreen" checked={gameWindow.fullscreen} onChange={handleFullScreenChange}>Полноэкранный режим</Checkbox>
        </div>
    )
}
export default SettingsPage

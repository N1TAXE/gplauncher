import React, { useEffect, useState } from 'react'
import Preloader from '../components/Preloader'
const UpdateProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [status, setStatus] = useState('checkingForUpdate')

    const ipcRenderer = window.electron.ipcRenderer;

    useEffect(() => {
        ipcRenderer.send('launcher:getUpdates')
        ipcRenderer.on('launcher:checkingForUpdate', () => {
            setStatus('checkingForUpdate')
        })
        ipcRenderer.on('launcher:updateAvailable', () => {
            setStatus('updateAvailable')
        })
        ipcRenderer.on('launcher:updateNotAvailable', () => {
            setStatus('updateNotAvailable')
        })
        ipcRenderer.on('launcher:updateDownloaded', () => {
            setStatus('updateDownloaded')
        })
        ipcRenderer.on('launcher:updateCancelled', () => {
            setStatus('updateNotAvailable')
        })
    }, [])

    useEffect(() => {
        if (status === 'updateNotAvailable') {
            setTimeout(() => {
                setIsLoading(false)
            }, 2000)
        }
    }, [status])

    const getInfo = (): {message: string} => {
        switch (status) {
            default:
            case 'checkingForUpdate':
                return {message: 'Проверка обновлений...'}
            case 'updateAvailable':
                return {message: 'Обновление доступно! Скачиваем...'}
            case 'updateNotAvailable':
                return {message: 'Установлена последняя версия приложения'}
            case 'updateDownloaded':
                return {message: 'Обновление скачано! Устанавливаем...'}
        }
    }

    if (isLoading) return <Preloader>{getInfo().message}</Preloader>

    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export default UpdateProvider

import React, { useEffect, useState } from 'react'
import { TailSpin } from 'react-loader-spinner'
const UpdateProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [status, setStatus] = useState('checkingForUpdate')

    const ipcRenderer = window.electron.ipcRenderer;

    useEffect(() => {
        ipcRenderer.send('launcher:getUpdates')
        ipcRenderer.on('launcher:checkingForUpdate', () => {
            console.log('checkingForUpdate')
            setStatus('checkingForUpdate')
        })
        ipcRenderer.on('launcher:updateAvailable', () => {
            console.log('updateAvailable')
            setStatus('updateAvailable')
        })
        ipcRenderer.on('launcher:updateNotAvailable', () => {
            console.log('updateNotAvailable')
            setStatus('updateNotAvailable')
        })
        ipcRenderer.on('launcher:updateDownloaded', () => {
            console.log('updateDownloaded')
            setStatus('updateDownloaded')
        })
        ipcRenderer.on('launcher:updateCancelled', () => {
            console.log('updateCancelled')
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

    if (isLoading) {
        return (
            <div className="loader">
                <div className='loaderWrapper'>
                    <TailSpin
                        visible={true}
                        height="156"
                        width="156"
                        color="#74D372"
                        ariaLabel="tail-spin-loading"
                        radius="1"
                        strokeWidth={3}
                    />
                    <span>
                    {getInfo().message}
                </span>
                </div>
            </div>
        )
    } else {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        )
    }
}

export default UpdateProvider

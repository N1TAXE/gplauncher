import React, { useEffect, useState } from 'react'
import { TailSpin } from 'react-loader-spinner'
const UpdateProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [status, setStatus] = useState('checkingForUpdate')

    const ipcRenderer = window.electron.ipcRenderer;

    useEffect(() => {
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
    }, [])

    useEffect(() => {
        if (status === 'updateNotAvailable') {
            setTimeout(() => {
                setIsLoading(false)
            }, 10000)
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
                <TailSpin
                    visible={true}
                    height="156"
                    width="156"
                    color="#4fa94d"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
                <span>
                    {getInfo().message}
                </span>
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

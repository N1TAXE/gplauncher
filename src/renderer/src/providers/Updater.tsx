import React, { useEffect, useState } from 'react'
import Preloader from '../components/Preloader'
import { StoreTypes } from '../../../types'
import { useTranslation } from 'react-i18next'
const UpdateProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const {t, i18n} = useTranslation()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [status, setStatus] = useState('checkingForUpdate')
    const [store, setStore] = useState<StoreTypes | null>(null);

    const ipcRenderer = window.electron.ipcRenderer;

    useEffect(() => {
        ipcRenderer.send("launcher:getStore");
        ipcRenderer.send('launcher:getUpdates')

        ipcRenderer.on('launcher:getStore', (_e, data) => {
            setStore(data)
        })
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
        if (status === 'updateNotAvailable' && store) {
            setTimeout(() => {
                setIsLoading(false)
            }, 2000)
        }
    }, [status, store])

    useEffect(() => {
        if (store && store.lang) {
            i18n.changeLanguage(store.lang).catch((e) => console.log(e))
        }
    }, [store])

    const getInfo = (): {message: string} => {
        switch (status) {
            default:
            case 'checkingForUpdate':
                return {message: t("ln_checkingForUpdate")}
            case 'updateAvailable':
                return {message: t("ln_updateAvailable")}
            case 'updateNotAvailable':
                return {message: t("ln_updateNotAvailable")}
            case 'updateDownloaded':
                return {message: t("ln_updateDownloaded")}
        }
    }

    if (!store) return <Preloader/>
    if (isLoading) return <Preloader>{getInfo().message}</Preloader>

    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export default UpdateProvider

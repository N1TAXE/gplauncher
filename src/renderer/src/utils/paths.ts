import MainPage from '../pages/MainPage'
import { MAIN_ROUTE, SETTINGS_ROUTE } from './consts'
import SettingsPage from '../pages/SettingsPage'
export const publicRoutes = [
    {
        path: MAIN_ROUTE,
        Component: MainPage
    },
    {
        path: SETTINGS_ROUTE,
        Component: SettingsPage
    }
]

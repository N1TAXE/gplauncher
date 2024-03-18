import './assets/styles/styles.scss'
import ReactDOM from 'react-dom/client'
import {HashRouter} from 'react-router-dom'
import {AppRouter} from './providers/Router'
import { QueryClient, QueryClientProvider } from 'react-query'
import UpdateProvider from './providers/Updater'
import './i18n'
import { Suspense } from 'react'
import Preloader from './components/Preloader'

const queryClient = new QueryClient({})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <HashRouter>
        <QueryClientProvider client={queryClient}>
            <UpdateProvider>
                <Suspense fallback={<Preloader/>}>
                    <AppRouter/>
                </Suspense>
            </UpdateProvider>
        </QueryClientProvider>
    </HashRouter>
)

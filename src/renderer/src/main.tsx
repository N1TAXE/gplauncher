import './assets/styles/styles.scss'
import ReactDOM from 'react-dom/client'
import {HashRouter} from 'react-router-dom'
import {AppRouter} from './providers/Router'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <HashRouter>
        <QueryClientProvider client={queryClient}>
            <AppRouter/>
        </QueryClientProvider>
    </HashRouter>
)

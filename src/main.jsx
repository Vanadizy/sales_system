import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppErrorBoundary from './components/AppErrorBoundary'
import App from './routes/App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)

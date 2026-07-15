import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: 'var(--matrix-text-primary)',
              border: '1px solid var(--matrix-border)',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
            },
            success: {
              iconTheme: { primary: 'var(--matrix-accent)', secondary: '#fff' }
            },
            error: {
              iconTheme: { primary: '#ff3355', secondary: '#fff' }
            }
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

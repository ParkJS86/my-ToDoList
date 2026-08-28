import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app/styles/tokens.css'
import App from './App.tsx'
import { bootstrapAuthInterceptor, bootstrapSession } from './features/auth/model/useRefreshToken'
import { initTheme } from './shared/lib/theme'

bootstrapAuthInterceptor()
bootstrapSession()
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/I18nContext'
import { ThemeProvider } from './theme/ThemeContext'
import Home from './components/home'
import './main.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <Home />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
)

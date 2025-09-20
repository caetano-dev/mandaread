import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TextProvider } from './contexts/TextContext'
import { AppProvider } from './contexts/AppContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <TextProvider>
          <App />
        </TextProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AamsProvider } from './lib/useAams'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AamsProvider>
        <App />
      </AamsProvider>
    </BrowserRouter>
  </StrictMode>,
)


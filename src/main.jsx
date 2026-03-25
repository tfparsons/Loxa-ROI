import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoxaROI from './LoxaROI.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoxaROI />
  </StrictMode>,
)

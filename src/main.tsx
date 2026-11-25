import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { mockAnalysis } from './mock/service'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('CekDulu tidak dapat dimuat.')

createRoot(root).render(<StrictMode><App service={mockAnalysis} /></StrictMode>)

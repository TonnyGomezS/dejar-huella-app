import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ShelterProvider } from './context/ShelterContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ShelterProvider>
                    <App />
                </ShelterProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
)
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedUserRoute({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to="/login" replace />
}

export function ProtectedShelterRoute({ children }) {
    const shelterToken = localStorage.getItem('shelter_token')
    return shelterToken ? children : <Navigate to="/shelters/login" replace />
}

export function ProtectedAdminRoute({ children }) {
    const { token, isAdmin } = useAuth()
    if (!token)      return <Navigate to="/login" replace />
    if (!isAdmin())  return <Navigate to="/" replace />
    return children
}
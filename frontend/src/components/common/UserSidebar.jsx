import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function UserSidebar({ isOpen, onClose }) {
    const { user, token, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (e) {
            //
        } finally {
            logout()
            onClose()
            navigate('/')
        }
    }

    if (!token || !user) return null

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 right-0 h-full bg-white shadow-2xl z-50
                flex flex-col transition-all duration-300
                ${isOpen ? 'w-72' : 'w-0 overflow-hidden'}
            `}>
                {/* Botón cerrar */}
                <div className="flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Avatar e info del usuario */}
                <div className="flex flex-col items-center px-6 py-4 border-b border-gray-100">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl">
                        👤
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-gray-800 text-center">
                        {user.name}
                    </h2>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        {user.email}
                    </p>
                    {user.role === 'admin' && (
                        <span className="mt-2 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                            Administrador
                        </span>
                    )}
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
                    <Link
                        to="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <span>🏠</span> Mi panel
                    </Link>
                    <Link
                        to="/dashboard/compatibility"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <span>🐾</span> Mi compatibilidad
                    </Link>
                    <Link
                        to="/dashboard/requests"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <span>📋</span> Mis solicitudes
                    </Link>
                    <Link
                        to="/dashboard/events"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <span>📅</span> Mis eventos
                    </Link>
                    <Link
                        to="/dashboard/donations"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <span>💰</span> Mis donaciones
                    </Link>

                    {/* Enlace admin solo si es administrador */}
                    {user.role === 'admin' && (
                        <>
                            <div className="border-t border-gray-100 my-2" />
                            <Link
                                to="/admin"
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <span>⚙️</span> Panel de administración
                            </Link>
                        </>
                    )}
                </nav>

                {/* Cerrar sesión */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </>
    )
}
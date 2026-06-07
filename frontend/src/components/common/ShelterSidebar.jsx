import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

function Badge({ count }) {
    if (!count || count === 0) return null
    return (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {count > 99 ? '99+' : count}
        </span>
    )
}

export default function ShelterSidebar({ isOpen, onClose }) {
    const { shelter, shelterToken, logoutShelter } = useShelter()
    const navigate = useNavigate()
    const [badges, setBadges] = useState({
        requests: 0, events: 0, volunteer: 0, notifications: 0
    })

    useEffect(() => {
        if (!shelterToken) return
        const fetchBadges = async () => {
            try {
                const { data } = await api.get('/shelter-dashboard/summary', {
                    headers: { Authorization: `Bearer ${shelterToken}` }
                })
                setBadges(data.badges || {})
            } catch (e) {
                console.error(e)
            }
        }
        fetchBadges()
    }, [shelterToken])

    const handleLogout = async () => {
        try {
            await api.post('/shelters/auth/logout', {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
        } catch (e) {
            //
        } finally {
            logoutShelter()
            onClose()
            navigate('/')
        }
    }

    if (!shelterToken || !shelter) return null

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={onClose}
                />
            )}

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

                {/* Perfil */}
                <div className="flex flex-col items-center px-6 py-4 border-b border-gray-100">
                    {shelter.image_url ? (
                        <img
                            src={shelter.image_url}
                            alt={shelter.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-4xl">
                            🐾
                        </div>
                    )}
                    <h2 className="mt-3 text-lg font-bold text-gray-800 text-center">
                        {shelter.name}
                    </h2>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        {shelter.email}
                    </p>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                    <Link
                        to="/shelter/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>🏠</span>
                        <span className="flex-1">Panel principal</span>
                    </Link>
                    <Link
                        to="/shelter/animals"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>🐾</span>
                        <span className="flex-1">Mis animales</span>
                    </Link>
                    <Link
                        to="/shelter/requests"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>📋</span>
                        <span className="flex-1">Solicitudes</span>
                        <Badge count={badges.requests} />
                    </Link>
                    <Link
                        to="/shelter/events"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>📅</span>
                        <span className="flex-1">Eventos</span>
                        <Badge count={badges.events} />
                    </Link>
                    <Link
                        to="/shelter/campaigns"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>💰</span>
                        <span className="flex-1">Campañas</span>
                    </Link>
                    <Link
                        to="/shelter/volunteer"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>🙋</span>
                        <span className="flex-1">Voluntariado</span>
                        <Badge count={badges.volunteer} />
                    </Link>
                    <Link
                        to="/shelter/notifications"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                        <span>🔔</span>
                        <span className="flex-1">Notificaciones</span>
                        <Badge count={badges.notifications} />
                    </Link>
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
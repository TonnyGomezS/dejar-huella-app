import { useState, useEffect } from 'react'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const typeConfig = {
    new_adoption_request:     { label: 'Nueva solicitud de adopción',       icon: '🏠', color: 'bg-indigo-50 border-indigo-200'  },
    new_fostering_request:    { label: 'Nueva solicitud de acogida',        icon: '🤝', color: 'bg-emerald-50 border-emerald-200' },
    new_sponsorship_request:  { label: 'Nueva solicitud de apadrinamiento', icon: '💛', color: 'bg-amber-50 border-amber-200'     },
    new_volunteer_request:    { label: 'Nueva solicitud de voluntariado',   icon: '🙋', color: 'bg-rose-50 border-rose-200'       },
    new_donation:             { label: 'Nueva donación recibida',           icon: '💰', color: 'bg-violet-50 border-violet-200'   },
    new_event_registration:   { label: 'Nueva inscripción a evento',        icon: '📅', color: 'bg-sky-50 border-sky-200'         },
}

function timeAgo(dateStr) {
    const now  = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60)     return 'Hace un momento'
    if (diff < 3600)   return 'Hace ' + Math.floor(diff / 60) + ' min'
    if (diff < 86400)  return 'Hace ' + Math.floor(diff / 3600) + 'h'
    if (diff < 604800) return 'Hace ' + Math.floor(diff / 86400) + ' días'
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function ShelterNotifications() {
    const { shelterToken } = useShelter()

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading]             = useState(true)
    const [filterUnread, setFilterUnread]   = useState(false)
    const [markingAll, setMarkingAll]       = useState(false)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setNotifications(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.patch('/notifications/' + notificationId + '/read', {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setNotifications(prev => prev.map(n =>
                n.id === notificationId
                    ? { ...n, read_at: new Date().toISOString() }
                    : n
            ))
        } catch (e) {
            console.error(e)
        }
    }

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true)
        try {
            await api.patch('/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setNotifications(prev => prev.map(n => ({
                ...n,
                read_at: n.read_at || new Date().toISOString()
            })))
        } catch (e) {
            console.error(e)
        } finally {
            setMarkingAll(false)
        }
    }

    const unreadCount = notifications.filter(n => !n.read_at).length

    const filteredNotifications = filterUnread
        ? notifications.filter(n => !n.read_at)
        : notifications

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount > 0
                                ? unreadCount + ' sin leer'
                                : 'Todas leídas'
                            }
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={markingAll}
                            className="text-sm font-medium text-indigo-600 hover:underline disabled:text-gray-400 transition-colors"
                        >
                            {markingAll ? 'Marcando...' : 'Marcar todas como leídas'}
                        </button>
                    )}
                </div>

                {/* Filtro */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterUnread(false)}
                        className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                            !filterUnread
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                        )}
                    >
                        Todas ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilterUnread(true)}
                        className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                            filterUnread
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                        )}
                    >
                        Sin leer ({unreadCount})
                    </button>
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">🔔</span>
                        <p className="text-gray-400 mt-2">Cargando notificaciones...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">🔔</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            {filterUnread ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredNotifications.map(notification => {
                            const isRead  = !!notification.read_at
                            const type    = typeConfig[notification.type] || {
                                label: notification.title,
                                icon:  '🔔',
                                color: 'bg-gray-50 border-gray-200',
                            }

                            return (
                                <div
                                    key={notification.id}
                                    className={'rounded-2xl border p-4 transition-all ' + type.color + ' ' + (isRead ? 'opacity-60' : '')}
                                >
                                    <div className="flex items-start gap-4">

                                        {/* Icono */}
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                                            {type.icon}
                                        </div>

                                        {/* Contenido */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={'text-sm font-semibold ' + (isRead ? 'text-gray-500' : 'text-gray-800')}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={'text-sm mt-0.5 ' + (isRead ? 'text-gray-400' : 'text-gray-600')}>
                                                        {notification.message}
                                                    </p>
                                                </div>

                                                {/* Punto no leído */}
                                                {!isRead && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-gray-400">
                                                    {timeAgo(notification.created_at)}
                                                </p>
                                                {!isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-xs text-indigo-600 hover:underline font-medium"
                                                    >
                                                        Marcar como leída
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
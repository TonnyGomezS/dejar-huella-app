import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const requestTypeConfig = {
    adoption:    { label: 'Adopción',       icon: '🏠' },
    fostering:   { label: 'Acogida',        icon: '🤝' },
    sponsorship: { label: 'Apadrinamiento', icon: '💛' },
}

function timeAgo(dateStr) {
    const now  = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60)     return 'Hace un momento'
    if (diff < 3600)   return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400)  return `Hace ${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function ShelterDashboard() {
    const { shelter, shelterToken } = useShelter()

    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: res } = await api.get('/shelter-dashboard/summary', {
                    headers: { Authorization: `Bearer ${shelterToken}` }
                })
                setData(res)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [shelterToken])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">🐾</span>
                    <p className="text-gray-500 mt-3">Cargando panel...</p>
                </div>
            </div>
        )
    }

    const stats          = data?.stats           || {}
    const recentRequests = data?.recent_requests || []
    const recentActivity = data?.recent_activity || []
    const badges         = data?.badges          || {}

    const alerts = []
    if (badges.requests > 0)
        alerts.push({
            icon: '📋',
            message: `${badges.requests} solicitud${badges.requests > 1 ? 'es' : ''} pendiente${badges.requests > 1 ? 's' : ''} de revisar`,
            to: '/shelter/requests',
            color: 'border-amber-300 bg-amber-50 text-amber-800'
        })
    if (badges.volunteer > 0)
        alerts.push({
            icon: '🙋',
            message: `${badges.volunteer} solicitud${badges.volunteer > 1 ? 'es' : ''} de voluntariado nueva${badges.volunteer > 1 ? 's' : ''}`,
            to: '/shelter/volunteer',
            color: 'border-blue-300 bg-blue-50 text-blue-800'
        })
    if (badges.events > 0)
        alerts.push({
            icon: '📅',
            message: `${badges.events} evento${badges.events > 1 ? 's' : ''} en los próximos 7 días`,
            to: '/shelter/events',
            color: 'border-indigo-300 bg-indigo-50 text-indigo-800'
        })

    return (
        <div className="bg-gray-50" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div
                className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8"
                style={{ minHeight: 'calc(100vh - 64px)' }}
            >

                {/* Banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 text-[160px] opacity-10 select-none leading-none">
                        🐾
                    </div>
                    <p className="text-amber-100 text-sm font-medium mb-1 uppercase tracking-wider">
                        Panel de gestión
                    </p>
                    <h1 className="text-3xl font-bold mb-2">
                        {shelter?.name}
                    </h1>
                    <p className="text-amber-100 text-sm max-w-lg">
                        Gestiona tus animales, solicitudes y campañas desde aquí
                    </p>
                </div>

                {/* Alertas */}
                {alerts.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Pendiente de tu atención
                        </h2>
                        <div className="flex flex-col gap-2">
                            {alerts.map((alert, i) => (
                                <Link
                                    key={i}
                                    to={alert.to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${alert.color} hover:opacity-80 transition-opacity`}
                                >
                                    <span className="text-xl">{alert.icon}</span>
                                    <span className="text-sm font-medium">{alert.message}</span>
                                    <span className="ml-auto text-sm">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/shelter/animals"
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-3xl mb-2">🐾</span>
                        <span className="text-2xl font-bold text-gray-800">{stats.total_animals || 0}</span>
                        <span className="text-sm text-gray-500 mt-1">Animales</span>
                        <span className="text-xs text-green-600 font-medium mt-1">
                            {stats.available_animals || 0} disponibles
                        </span>
                    </Link>
                    <Link to="/shelter/requests"
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-3xl mb-2">📋</span>
                        <span className="text-2xl font-bold text-gray-800">{stats.pending_requests || 0}</span>
                        <span className="text-sm text-gray-500 mt-1">Solicitudes</span>
                        <span className="text-xs text-amber-600 font-medium mt-1">pendientes</span>
                    </Link>
                    <Link to="/shelter/events"
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-3xl mb-2">📅</span>
                        <span className="text-2xl font-bold text-gray-800">{badges.events || 0}</span>
                        <span className="text-sm text-gray-500 mt-1">Eventos</span>
                        <span className="text-xs text-indigo-600 font-medium mt-1">próximos 7 días</span>
                    </Link>
                    <Link to="/shelter/campaigns"
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-3xl mb-2">💰</span>
                        <span className="text-2xl font-bold text-gray-800">{stats.active_campaigns || 0}</span>
                        <span className="text-sm text-gray-500 mt-1">Campañas</span>
                        <span className="text-xs text-violet-600 font-medium mt-1">activas</span>
                    </Link>
                </div>

                {/* Solicitudes pendientes + Actividad reciente */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                    {/* Solicitudes (2/3) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">
                                Solicitudes pendientes
                            </h2>
                            <Link to="/shelter/requests"
                                className="text-sm text-amber-600 hover:underline font-medium">
                                Ver todas
                            </Link>
                        </div>

                        <div className="flex-1">
                            {recentRequests.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-10">
                                    <span className="text-4xl">✅</span>
                                    <p className="text-gray-400 mt-2 text-sm">
                                        No hay solicitudes pendientes
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {recentRequests.map(req => {
                                        const type = requestTypeConfig[req.type] || requestTypeConfig.adoption
                                        return (
                                            <div
                                                key={req.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{type.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {req.user?.name || '—'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {type.label} · {req.animal?.name || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">
                                                        {timeAgo(req.created_at)}
                                                    </span>
                                                    <Link
                                                        to="/shelter/requests"
                                                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Revisar
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actividad reciente (1/3) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">
                            Actividad reciente
                        </h2>

                        <div className="flex-1">
                            {recentActivity.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-10">
                                    <span className="text-4xl">💤</span>
                                    <p className="text-gray-400 mt-2 text-sm">
                                        Sin actividad reciente
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {recentActivity.map(activity => (
                                        <div key={activity.id} className="flex gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.read_at ? 'bg-gray-300' : 'bg-amber-500'}`} />
                                            <div>
                                                <p className="text-sm text-gray-700 leading-snug">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {timeAgo(activity.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
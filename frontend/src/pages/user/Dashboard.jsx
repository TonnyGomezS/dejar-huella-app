import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function UserDashboard() {
    const { user } = useAuth()

    const [requests, setRequests]       = useState([])
    const [stats, setStats]             = useState({ events: 0, donations: 0, pending: 0 })
    const [successStory, setSuccessStory] = useState(null)
    const [campaigns, setCampaigns]     = useState([])
    const [loading, setLoading]         = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/dashboard/summary')
                setRequests(data.requests || [])
                setStats(data.stats       || { events: 0, donations: 0, pending: 0 })
                setSuccessStory(data.success_story || null)
                setCampaigns(data.campaigns        || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statusConfig = {
        pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
        accepted:  { label: 'Aceptada',   color: 'bg-green-100 text-green-700'  },
        rejected:  { label: 'Rechazada',  color: 'bg-red-100 text-red-700'      },
        cancelled: { label: 'Cancelada',  color: 'bg-gray-100 text-gray-600'    },
    }

    const typeConfig = {
        adoption:    { label: 'Adopción',       icon: '🏠' },
        fostering:   { label: 'Acogida',         icon: '🤝' },
        sponsorship: { label: 'Apadrinamiento',  icon: '💛' },
    }

    const statusAnimalConfig = {
        adopted:  { label: 'Adoptado/a',   color: 'bg-green-100 text-green-700'  },
        fostered: { label: 'En acogida',    color: 'bg-blue-100 text-blue-700'    },
        reserved: { label: 'Apadrinado/a', color: 'bg-purple-100 text-purple-700' },
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">🐾</span>
                    <p className="text-gray-500 mt-3">Cargando tu panel...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Banner de bienvenida */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 text-[160px] opacity-10 select-none leading-none">
                        🐾
                    </div>
                    <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">
                        Bienvenido de vuelta
                    </p>
                    <h1 className="text-3xl font-bold mb-3">
                        Hola, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-indigo-100 max-w-lg leading-relaxed text-sm">
                        Gracias por formar parte de nuestra comunidad.
                        Cada gesto cuenta: desde una donación hasta
                        abrir las puertas de tu hogar a un animal.
                        <span className="font-semibold text-white"> Tu huella importa.</span>
                    </p>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">
                            📅
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.events}</p>
                            <p className="text-sm text-gray-500">Eventos asistidos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                            💰
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.donations}</p>
                            <p className="text-sm text-gray-500">Campañas apoyadas</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl flex-shrink-0">
                            📋
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                            <p className="text-sm text-gray-500">Solicitudes pendientes</p>
                        </div>
                    </div>
                </div>

                {/* Solicitudes + Historia de éxito */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Solicitudes (2/3) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">
                                Estado de tus solicitudes
                            </h2>
                            <Link to="/dashboard/requests"
                                className="text-sm text-indigo-600 hover:underline font-medium">
                                Ver todas
                            </Link>
                        </div>

                        {requests.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="text-4xl">🐕</span>
                                <p className="text-gray-400 mt-2 text-sm">
                                    Aún no tienes solicitudes activas
                                </p>
                                <Link to="/animals"
                                    className="mt-3 inline-block text-sm text-indigo-600 font-medium hover:underline">
                                    Explorar animales
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="pb-3 font-medium">Animal</th>
                                            <th className="pb-3 font-medium">Tipo</th>
                                            <th className="pb-3 font-medium">Protectora</th>
                                            <th className="pb-3 font-medium">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requests.map(req => {
                                            const status = statusConfig[req.status] || statusConfig.pending
                                            const type   = typeConfig[req.type]    || typeConfig.adoption
                                            return (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 font-medium text-gray-800">
                                                        {req.animal?.name || '—'}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            {type.icon} {type.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        {req.animal?.shelter?.name || '—'}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Historia de éxito (1/3) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            Historia de éxito ✨
                        </h2>

                        {successStory ? (
                            <>
                                <div className="flex-1">
                                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-4">
                                        {successStory.image_url ? (
                                            <img
                                                src={successStory.image_url}
                                                alt={successStory.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {successStory.species === 'dog' ? '🐕' : '🐈'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-800">
                                            {successStory.name}
                                        </h3>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusAnimalConfig[successStory.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                                            {statusAnimalConfig[successStory.status]?.label || successStory.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {successStory.description
                                            ? successStory.description.slice(0, 100) + '...'
                                            : `${successStory.name} encontró un hogar gracias a nuestra comunidad.`
                                        }
                                    </p>
                                </div>
                                <Link
                                    to={`/animals/${successStory.id}`}
                                    className="mt-4 block text-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                >
                                    Ver historia
                                </Link>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                <span className="text-4xl">🌟</span>
                                <p className="text-gray-400 mt-2 text-sm">
                                    Pronto habrá historias de éxito aquí
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Campañas cerca del objetivo */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-800">
                            Campañas que necesitan tu ayuda
                        </h2>
                        <Link to="/campaigns"
                            className="text-sm text-indigo-600 hover:underline font-medium">
                            Ver todas
                        </Link>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl">💰</span>
                            <p className="text-gray-400 mt-2 text-sm">
                                No hay campañas activas en este momento
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {campaigns.map(campaign => (
                                <div
                                    key={campaign.id}
                                    className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Imagen o placeholder */}
                                    <div className="h-32 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center relative">
                                        {campaign.animal?.image_url ? (
                                            <img
                                                src={campaign.animal.image_url}
                                                alt={campaign.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">💛</span>
                                        )}
                                        {/* Badge progreso */}
                                        <span className="absolute top-2 right-2 bg-white/90 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            {campaign.progress_percent}%
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <p className="font-semibold text-gray-800 text-sm line-clamp-1 mb-1">
                                            {campaign.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {campaign.shelter?.name}
                                        </p>

                                        {/* Barra de progreso */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                            <div
                                                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                style={{ width: `${Math.min(campaign.progress_percent, 100)}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>{campaign.raised_amount}€ recaudados</span>
                                            <span>Meta: {campaign.goal_amount}€</span>
                                        </div>

                                        <Link
                                            to={`/campaigns/${campaign.id}`}
                                            className="block text-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
                                        >
                                            Visitar campaña
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
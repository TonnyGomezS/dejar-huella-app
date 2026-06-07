import { useState, useEffect } from 'react'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const statusConfig = {
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    accepted:  { label: 'Aceptada',   color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
    rejected:  { label: 'Rechazada',  color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
    cancelled: { label: 'Cancelada',  color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400'   },
}

const typeConfig = {
    adoption:    { label: 'Adopción',       icon: '🏠', color: 'bg-indigo-100 text-indigo-700' },
    fostering:   { label: 'Acogida',        icon: '🤝', color: 'bg-emerald-100 text-emerald-700' },
    sponsorship: { label: 'Apadrinamiento', icon: '💛', color: 'bg-amber-100 text-amber-700'   },
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

export default function ShelterRequests() {
    const { shelterToken } = useShelter()

    const [requests, setRequests]       = useState([])
    const [loading, setLoading]         = useState(true)
    const [filterStatus, setFilterStatus] = useState('pending')
    const [processing, setProcessing]   = useState(null)
    const [expandedAnimal, setExpandedAnimal] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [filterStatus])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterStatus) params.append('status', filterStatus)

            const { data } = await api.get(`/shelter/requests?${params.toString()}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setRequests(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (requestId) => {
        setProcessing(requestId)
        try {
            await api.patch(`/requests/${requestId}/accept`, {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            await fetchRequests()
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (requestId) => {
        setProcessing(requestId)
        try {
            await api.patch(`/requests/${requestId}/reject`, {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            await fetchRequests()
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(null)
        }
    }

    // Agrupamos las solicitudes por animal
    const groupedByAnimal = requests.reduce((acc, req) => {
        const animalId = req.animal?.id || 'unknown'
        if (!acc[animalId]) {
            acc[animalId] = {
                animal:   req.animal,
                requests: [],
            }
        }
        acc[animalId].requests.push(req)
        return acc
    }, {})

    const totalPending = requests.filter(r => r.status === 'pending').length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {totalPending > 0
                                ? `${totalPending} solicitud${totalPending > 1 ? 'es' : ''} pendiente${totalPending > 1 ? 's' : ''} de revisar`
                                : 'Todas las solicitudes revisadas'
                            }
                        </p>
                    </div>
                </div>

                {/* Filtros de estado */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { value: 'pending',   label: 'Pendientes'  },
                        { value: 'accepted',  label: 'Aceptadas'   },
                        { value: 'rejected',  label: 'Rechazadas'  },
                        { value: 'cancelled', label: 'Canceladas'  },
                        { value: '',          label: 'Todas'       },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterStatus(opt.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                filterStatus === opt.value
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">📋</span>
                        <p className="text-gray-400 mt-2">Cargando solicitudes...</p>
                    </div>
                ) : Object.keys(groupedByAnimal).length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">✅</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No hay solicitudes {filterStatus ? statusConfig[filterStatus]?.label.toLowerCase() + 's' : ''}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {Object.values(groupedByAnimal).map(group => {
                            const animal    = group.animal
                            const isExpanded = expandedAnimal === animal?.id
                            const pendingCount = group.requests.filter(r => r.status === 'pending').length

                            return (
                                <div
                                    key={animal?.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Cabecera del animal */}
                                    <button
                                        onClick={() => setExpandedAnimal(isExpanded ? null : animal?.id)}
                                        className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        {/* Foto */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {animal?.image_url ? (
                                                <img
                                                    src={animal.image_url}
                                                    alt={animal.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    {animal?.species === 'dog' ? '🐕' : '🐈'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info animal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800">
                                                    {animal?.name || 'Animal desconocido'}
                                                </h3>
                                                {pendingCount > 0 && (
                                                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {animal?.breed || (animal?.species === 'dog' ? 'Perro' : 'Gato')}
                                                {' · '}
                                                {group.requests.length} solicitud{group.requests.length > 1 ? 'es' : ''}
                                            </p>
                                        </div>

                                        {/* Toggle */}
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Lista de solicitudes */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                                            {group.requests.map(req => {
                                                const status = statusConfig[req.status] || statusConfig.pending
                                                const type   = typeConfig[req.type]    || typeConfig.adoption
                                                const isPending = req.status === 'pending'

                                                return (
                                                    <div key={req.id} className="p-5">
                                                        <div className="flex items-start justify-between gap-4">

                                                            {/* Info solicitante */}
                                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                                                                    👤
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="font-medium text-gray-800">
                                                                            {req.user?.name || '—'}
                                                                        </p>
                                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type.color}`}>
                                                                            {type.icon} {type.label}
                                                                        </span>
                                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                                                                            {status.label}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        {req.user?.email || '—'} · {timeAgo(req.created_at)}
                                                                    </p>
                                                                    {req.message && (
                                                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-xl px-4 py-3 italic">
                                                                            "{req.message}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Acciones */}
                                                            {isPending && (
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <button
                                                                        onClick={() => handleAccept(req.id)}
                                                                        disabled={processing === req.id}
                                                                        className="text-sm bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium px-4 py-2 rounded-xl transition-colors"
                                                                    >
                                                                        {processing === req.id ? '...' : 'Aceptar'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(req.id)}
                                                                        disabled={processing === req.id}
                                                                        className="text-sm border border-red-200 text-red-500 hover:bg-red-50 font-medium px-4 py-2 rounded-xl transition-colors"
                                                                    >
                                                                        {processing === req.id ? '...' : 'Rechazar'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
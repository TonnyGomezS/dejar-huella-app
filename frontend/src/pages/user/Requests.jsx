import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const statusConfig = {
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
    accepted:  { label: 'Aceptada',   color: 'bg-green-100 text-green-700'   },
    rejected:  { label: 'Rechazada',  color: 'bg-red-100 text-red-700'       },
    cancelled: { label: 'Cancelada',  color: 'bg-gray-100 text-gray-500'     },
}

const typeConfig = {
    adoption:    { label: 'Adopción',       icon: '🏠', color: 'bg-indigo-100 text-indigo-700'   },
    fostering:   { label: 'Acogida',        icon: '🤝', color: 'bg-emerald-100 text-emerald-700' },
    sponsorship: { label: 'Apadrinamiento', icon: '💛', color: 'bg-amber-100 text-amber-700'     },
}

const ageLabels = {
    puppy:  'Cachorro',
    kitten: 'Gatito',
    adult:  'Adulto',
    senior: 'Senior',
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

export default function UserRequests() {
    const [requests, setRequests]         = useState([])
    const [loading, setLoading]           = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [cancelling, setCancelling]     = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/requests')
            setRequests(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (requestId) => {
        if (!confirm('¿Seguro que quieres cancelar esta solicitud?')) return
        setCancelling(requestId)
        try {
            await api.delete('/requests/' + requestId)
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'cancelled' } : r
            ))
        } catch (e) {
            console.error(e)
        } finally {
            setCancelling(null)
        }
    }

    const filtered = filterStatus
        ? requests.filter(r => r.status === filterStatus)
        : requests

    const pendingCount = requests.filter(r => r.status === 'pending').length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Mis solicitudes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {pendingCount > 0
                            ? pendingCount + ' solicitud' + (pendingCount > 1 ? 'es' : '') + ' pendiente' + (pendingCount > 1 ? 's' : '')
                            : requests.length + ' solicitud' + (requests.length !== 1 ? 'es' : '') + ' en total'
                        }
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { value: '',          label: 'Todas'       },
                        { value: 'pending',   label: 'Pendientes'  },
                        { value: 'accepted',  label: 'Aceptadas'   },
                        { value: 'rejected',  label: 'Rechazadas'  },
                        { value: 'cancelled', label: 'Canceladas'  },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterStatus(opt.value)}
                            className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                                filterStatus === opt.value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                            )}
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
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">📋</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            {filterStatus ? 'No tienes solicitudes ' + (statusConfig[filterStatus]?.label.toLowerCase() + 's') : 'Aún no tienes solicitudes'}
                        </p>
                        {!filterStatus && (
                            <Link
                                to="/animals"
                                className="mt-4 inline-block text-sm text-indigo-600 font-medium hover:underline"
                            >
                                Explorar animales
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(req => {
                            const status = statusConfig[req.status] || statusConfig.pending
                            const type   = typeConfig[req.type]    || typeConfig.adoption
                            const animal = req.animal

                            return (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                                >
                                    <div className="flex gap-4">

                                        {/* Foto animal */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {animal?.image_url ? (
                                                <img
                                                    src={animal.image_url}
                                                    alt={animal.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                                    {animal?.species === 'dog' ? '🐕' : '🐈'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">
                                                        {animal?.name || '—'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {animal?.breed || (animal?.species === 'dog' ? 'Perro' : 'Gato')}
                                                        {animal?.age_range && ' · ' + (ageLabels[animal.age_range] || animal.age_range)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={'text-xs font-medium px-2.5 py-1 rounded-full ' + type.color}>
                                                        {type.icon} {type.label}
                                                    </span>
                                                    <span className={'text-xs font-medium px-2.5 py-1 rounded-full ' + status.color}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Protectora */}
                                            <p className="text-xs text-gray-400 mb-3">
                                                🏠 {animal?.shelter?.name || '—'} · {timeAgo(req.created_at)}
                                            </p>

                                            {/* Mensaje */}
                                            {req.message && (
                                                <p className="text-sm text-gray-600 italic bg-gray-50 px-4 py-2.5 rounded-xl mb-3">
                                                    "{req.message}"
                                                </p>
                                            )}

                                            {/* Acciones */}
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={'/animals/' + (animal?.id || '')}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    Ver animal
                                                </Link>
                                                {req.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancel(req.id)}
                                                        disabled={cancelling === req.id}
                                                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        {cancelling === req.id ? '...' : 'Cancelar solicitud'}
                                                    </button>
                                                )}
                                                {req.status === 'accepted' && (
                                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                        ✅ La protectora se pondrá en contacto contigo
                                                    </span>
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
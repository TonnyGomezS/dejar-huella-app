import { useState, useEffect } from 'react'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const statusConfig = {
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
    accepted:  { label: 'Aceptada',   color: 'bg-green-100 text-green-700'   },
    rejected:  { label: 'Rechazada',  color: 'bg-red-100 text-red-700'       },
    cancelled: { label: 'Cancelada',  color: 'bg-gray-100 text-gray-500'     },
}

const availabilityLabels = {
    mornings:   { label: 'Mañanas',          icon: '🌅' },
    afternoons: { label: 'Tardes',           icon: '🌇' },
    weekends:   { label: 'Fines de semana',  icon: '📅' },
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

export default function ShelterVolunteer() {
    const { shelterToken } = useShelter()

    const [requests, setRequests]         = useState([])
    const [loading, setLoading]           = useState(true)
    const [filterStatus, setFilterStatus] = useState('pending')
    const [processing, setProcessing]     = useState(null)
    const [profileModal, setProfileModal] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [filterStatus])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/shelter/volunteer-requests', {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            const list = data || []
            setRequests(filterStatus ? list.filter(r => r.status === filterStatus) : list)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (requestId) => {
        setProcessing(requestId)
        try {
            await api.patch('/volunteer-requests/' + requestId + '/accept', {}, {
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
            await api.patch('/volunteer-requests/' + requestId + '/reject', {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            await fetchRequests()
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(null)
        }
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Voluntariado</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filterStatus === 'pending' && pendingCount > 0
                            ? pendingCount + ' solicitud' + (pendingCount > 1 ? 'es' : '') + ' pendiente' + (pendingCount > 1 ? 's' : '') + ' de revisar'
                            : 'Gestiona las solicitudes de voluntariado'
                        }
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { value: 'pending',   label: 'Pendientes' },
                        { value: 'accepted',  label: 'Aceptadas'  },
                        { value: 'rejected',  label: 'Rechazadas' },
                        { value: '',          label: 'Todas'      },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterStatus(opt.value)}
                            className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                                filterStatus === opt.value
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">🙋</span>
                        <p className="text-gray-400 mt-2">Cargando solicitudes...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">🙋</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No hay solicitudes {filterStatus && statusConfig[filterStatus] ? statusConfig[filterStatus].label.toLowerCase() + 's' : ''}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {requests.map(req => {
                            const status    = statusConfig[req.status] || statusConfig.pending
                            const isPending = req.status === 'pending'

                            return (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                                >
                                    <div className="flex items-center justify-between gap-4">

                                        {/* Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                                                👤
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-gray-800">
                                                        {req.user?.name || '—'}
                                                    </p>
                                                    <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + status.color}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    ha solicitado realizar labores de voluntariado · {timeAgo(req.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setProfileModal(req)}
                                                className="text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                Ver perfil
                                            </button>
                                            {isPending && (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(req.id)}
                                                        disabled={processing === req.id}
                                                        className="text-sm font-medium px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white transition-colors"
                                                    >
                                                        {processing === req.id ? '...' : 'Aceptar'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={processing === req.id}
                                                        className="text-sm font-medium px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        {processing === req.id ? '...' : 'Rechazar'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal perfil del voluntario */}
            {profileModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">

                        {/* Cabecera modal */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{profileModal.user?.name}</p>
                                <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (statusConfig[profileModal.status]?.color || '')}>
                                    {statusConfig[profileModal.status]?.label}
                                </span>
                            </div>
                        </div>

                        {/* Disponibilidad */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Disponibilidad
                            </p>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl">
                                <span>{availabilityLabels[profileModal.availability]?.icon || '📅'}</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {availabilityLabels[profileModal.availability]?.label || profileModal.availability}
                                </span>
                            </div>
                        </div>

                        {/* Intereses */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Intereses
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
                                {profileModal.interests}
                            </p>
                        </div>

                        {/* Mensaje */}
                        {profileModal.message && (
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Mensaje
                                </p>
                                <p className="text-sm text-gray-600 italic bg-gray-50 px-4 py-3 rounded-xl">
                                    "{profileModal.message}"
                                </p>
                            </div>
                        )}

                        {/* Acciones dentro del modal */}
                        {profileModal.status === 'pending' && (
                            <div className="flex gap-3 mb-3">
                                <button
                                    onClick={() => {
                                        handleAccept(profileModal.id)
                                        setProfileModal(null)
                                    }}
                                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(profileModal.id)
                                        setProfileModal(null)
                                    }}
                                    className="flex-1 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors"
                                >
                                    Rechazar
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setProfileModal(null)}
                            className="w-full py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
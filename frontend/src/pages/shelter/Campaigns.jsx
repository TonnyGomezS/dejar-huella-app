import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const statusConfig = {
    active:    { label: 'Activa',     color: 'bg-green-100 text-green-700' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-500'   },
    cancelled: { label: 'Cancelada',  color: 'bg-red-100 text-red-700'     },
}

function daysLeft(endDate) {
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
}

export default function ShelterCampaigns() {
    const { shelter, shelterToken } = useShelter()

    const [campaigns, setCampaigns]               = useState([])
    const [loading, setLoading]                   = useState(true)
    const [filterStatus, setFilterStatus]         = useState('active')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showUpdateModal, setShowUpdateModal]   = useState(false)
    const [showCloseModal, setShowCloseModal]     = useState(false)
    const [updateForm, setUpdateForm]             = useState({ title: '', content: '', image_url: '' })
    const [processing, setProcessing]             = useState(false)
    const [error, setError]                       = useState(null)

    useEffect(() => {
        fetchCampaigns()
    }, [filterStatus])

    const fetchCampaigns = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('shelter_id', shelter.id)
            if (filterStatus) params.append('status', filterStatus)

            const { data } = await api.get(`/campaigns?${params.toString()}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })

            setCampaigns(data.data?.data || data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = async () => {
        if (!selectedCampaign) return
        setProcessing(true)
        try {
            await api.patch(`/campaigns/${selectedCampaign.id}/close`, {}, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            await fetchCampaigns()
            setShowCloseModal(false)
            setSelectedCampaign(null)
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (campaignId) => {
        if (!confirm('¿Seguro que quieres eliminar esta campaña?')) return
        try {
            await api.delete(`/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setCampaigns(prev => prev.filter(c => c.id !== campaignId))
        } catch (e) {
            console.error(e)
        }
    }

    const handlePublishUpdate = async () => {
        if (!updateForm.title || !updateForm.content) {
            setError('El título y el contenido son obligatorios')
            return
        }
        setProcessing(true)
        setError(null)
        try {
            await api.post(`/campaigns/${selectedCampaign.id}/updates`, updateForm, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setShowUpdateModal(false)
            setUpdateForm({ title: '', content: '', image_url: '' })
        } catch (e) {
            setError(e.response?.data?.message || 'Error al publicar la actualización')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mis campañas</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        to="/shelter/campaigns/create"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                    >
                        <span>+</span> Nueva campaña
                    </Link>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6">
                    {[
                        { value: 'active',    label: 'Activas'     },
                        { value: 'completed', label: 'Completadas'  },
                        { value: '',          label: 'Todas'        },
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
                        <span className="text-4xl animate-bounce inline-block">💰</span>
                        <p className="text-gray-400 mt-2">Cargando campañas...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">💰</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No tienes campañas {filterStatus === 'active' ? 'activas' : ''}
                        </p>
                        {filterStatus === 'active' && (
                            <Link
                                to="/shelter/campaigns/create"
                                className="mt-4 inline-block text-sm text-amber-600 font-medium hover:underline"
                            >
                                Crear primera campaña
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {campaigns.map(campaign => {
                            const status   = statusConfig[campaign.status] || statusConfig.active
                            const progress = campaign.progress_percent || 0
                            const days     = daysLeft(campaign.end_date)
                            const isActive = campaign.status === 'active'

                            return (
                                <div
                                    key={campaign.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <div className="flex items-start gap-4">

                                        {/* Imagen */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {campaign.animal?.image_url ? (
                                                <img
                                                    src={campaign.animal.image_url}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                                    💛
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">
                                                        {campaign.title}
                                                    </h3>
                                                    {campaign.animal && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            🐾 {campaign.animal.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    {isActive && (
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                            days <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {days === 0 ? '¡Último día!' : `${days} días`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progreso */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span className="font-medium">{progress}% conseguido</span>
                                                    <span>{campaign.raised_amount || 0}€ de {campaign.goal_amount}€</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-amber-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex flex-wrap gap-2">
                                                {isActive && (
                                                    <>
                                                        <Link
                                                            to={`/shelter/campaigns/${campaign.id}/edit`}
                                                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCampaign(campaign)
                                                                setShowUpdateModal(true)
                                                                setError(null)
                                                            }}
                                                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        >
                                                            Publicar actualización
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCampaign(campaign)
                                                                setShowCloseModal(true)
                                                            }}
                                                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                                                        >
                                                            Cerrar campaña
                                                        </button>
                                                    </>
                                                )}
                                                {!isActive && (
                                                    <button
                                                        onClick={() => handleDelete(campaign.id)}
                                                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        Eliminar
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

            {/* Modal publicar actualización */}
            {showUpdateModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            Publicar actualización
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {selectedCampaign.title}
                        </p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Título <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={updateForm.title}
                                    onChange={e => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ej: ¡Buenas noticias sobre Lulú!"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Contenido <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={updateForm.content}
                                    onChange={e => setUpdateForm(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Cuéntales a los donantes las novedades..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    URL de imagen
                                    <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={updateForm.image_url}
                                    onChange={e => setUpdateForm(prev => ({ ...prev, image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowUpdateModal(false)
                                    setUpdateForm({ title: '', content: '', image_url: '' })
                                    setError(null)
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePublishUpdate}
                                disabled={processing}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {processing ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal cerrar campaña */}
            {showCloseModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-gray-800 text-lg mb-2">
                            ¿Cerrar esta campaña?
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                            {selectedCampaign.title}
                        </p>
                        <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-xl mb-6">
                            Una vez cerrada no podrás recibir más donaciones ni reactivarla.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={processing}
                                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {processing ? 'Cerrando...' : 'Cerrar campaña'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
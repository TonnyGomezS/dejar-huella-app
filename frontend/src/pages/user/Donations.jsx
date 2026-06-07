import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const paymentStatusConfig = {
    completed: { label: 'Completado', color: 'bg-green-100 text-green-700',  icon: '✅' },
    failed:    { label: 'Fallido',    color: 'bg-red-100 text-red-700',      icon: '❌' },
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    })
}

export default function UserDonations() {
    const [donations, setDonations]       = useState([])
    const [loading, setLoading]           = useState(true)
    const [filterStatus, setFilterStatus] = useState('')

    useEffect(() => {
        fetchDonations()
    }, [])

    const fetchDonations = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/dashboard/donations/list')
            setDonations(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filtered = filterStatus
        ? donations.filter(d => d.payment_status === filterStatus)
        : donations

    const totalDonated = donations
        .filter(d => d.payment_status === 'completed')
        .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Mis donaciones</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {totalDonated > 0
                            ? 'Has donado un total de ' + totalDonated.toFixed(2) + '€'
                            : 'Aún no has realizado ninguna donación'
                        }
                    </p>
                </div>

                {/* Tarjeta resumen */}
                {totalDonated > 0 && (
                    <div className="bg-gradient-to-r from-violet-600 to-purple-400 rounded-2xl p-6 mb-6 text-white">
                        <p className="text-violet-200 text-sm mb-1">Total donado</p>
                        <p className="text-4xl font-bold">{totalDonated.toFixed(2)}€</p>
                        <p className="text-violet-200 text-sm mt-2">
                            en {donations.filter(d => d.payment_status === 'completed').length} donación{donations.filter(d => d.payment_status === 'completed').length !== 1 ? 'es' : ''} completada{donations.filter(d => d.payment_status === 'completed').length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { value: '',          label: 'Todas'       },
                        { value: 'completed', label: 'Completadas' },
                        { value: 'failed',    label: 'Fallidas'    },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterStatus(opt.value)}
                            className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                                filterStatus === opt.value
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">💰</span>
                        <p className="text-gray-400 mt-2">Cargando donaciones...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">💰</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            {filterStatus ? 'No tienes donaciones ' + (filterStatus === 'completed' ? 'completadas' : 'fallidas') : 'Aún no has realizado ninguna donación'}
                        </p>
                        {!filterStatus && (
                            <Link
                                to="/campaigns"
                                className="mt-4 inline-block text-sm text-violet-600 font-medium hover:underline"
                            >
                                Ver campañas activas
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(donation => {
                            const status   = paymentStatusConfig[donation.payment_status] || paymentStatusConfig.pending
                            const campaign = donation.campaign

                            return (
                                <div
                                    key={donation.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                                >
                                    <div className="flex gap-4">

                                        {/* Imagen campaña */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {campaign?.animal?.image_url ? (
                                                <img
                                                    src={campaign.animal.image_url}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    💛
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-800 truncate">
                                                        {campaign?.title || 'Campaña eliminada'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        🏠 {campaign?.shelter?.name || '—'} · {formatDate(donation.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xl font-bold text-gray-800">
                                                        {parseFloat(donation.amount).toFixed(2)}€
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className={'text-xs font-medium px-2.5 py-1 rounded-full ' + status.color}>
                                                    {status.icon} {status.label}
                                                </span>
                                                {campaign?.id && (
                                                    <Link
                                                        to={'/campaigns/' + campaign.id}
                                                        className="text-xs font-medium text-violet-600 hover:underline"
                                                    >
                                                        Ver campaña
                                                    </Link>
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
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function daysLeft(endDate) {
    const now  = new Date()
    const end  = new Date(endDate)
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
}

function CampaignCard({ campaign, accent }) {
    const days     = daysLeft(campaign.end_date)
    const progress = campaign.progress_percent || 0

    const accentConfig = {
        red:    { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',    btn: 'bg-red-500 hover:bg-red-600'       },
        green:  { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-500 hover:bg-emerald-600' },
        indigo: { bar: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-500 hover:bg-indigo-600'  },
    }

    const colors = accentConfig[accent] || accentConfig.indigo

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            {/* Imagen */}
            <div className="h-40 bg-gray-100 relative">
                {campaign.animal?.image_url ? (
                    <img
                        src={campaign.animal.image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-50 to-violet-50">
                        💛
                    </div>
                )}

                {/* Badge días restantes */}
                <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                        days <= 5 ? 'bg-red-100 text-red-700' : 'bg-white/90 text-gray-700'
                    }`}>
                        {days === 0 ? '¡Último día!' : `${days} días`}
                    </span>
                </div>

                {/* Badge animal si lo tiene */}
                {campaign.animal && (
                    <div className="absolute bottom-3 left-3">
                        <span className="text-xs bg-white/90 text-gray-700 px-2.5 py-1 rounded-full font-medium shadow-sm">
                            {campaign.animal.species === 'dog' ? '🐕' : '🐈'} {campaign.animal.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                    {campaign.title}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                    🏠 {campaign.shelter?.name}
                </p>

                {/* Barra de progreso */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium">{progress}% conseguido</span>
                        <span>{campaign.raised_amount}€ de {campaign.goal_amount}€</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${colors.bar}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>

                <Link
                    to={`/campaigns/${campaign.id}`}
                    className={`mt-4 block text-center text-sm text-white font-medium py-2.5 rounded-xl transition-colors ${colors.btn}`}
                >
                    Colaborar
                </Link>
            </div>
        </div>
    )
}

export default function CampaignList() {
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/campaigns?per_page=50')
            const list = data.data?.data || data.data || []

            // Calculamos días restantes y ordenamos
            const withDays = list.map(c => ({
                ...c,
                days_left: daysLeft(c.end_date),
            }))

            setCampaigns(withDays)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Separamos en tres grupos
    const urgent   = campaigns.filter(c => c.days_left <= 7 && c.progress_percent < 80)
    const almostDone = campaigns.filter(c => c.progress_percent >= 80 && c.progress_percent < 100)
    const ongoing  = campaigns.filter(c => c.days_left > 7 && c.progress_percent < 80)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-4xl animate-bounce inline-block">💰</span>
                    <p className="text-gray-400 mt-2">Cargando campañas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-400 text-white py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        💰 Campañas de crowdfunding
                    </h1>
                    <p className="text-white/80">
                        Ayuda a financiar el cuidado de animales que lo necesitan
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">

                {/* Urgentes */}
                {urgent.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-2xl">🔴</span>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Urgentes
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Terminan pronto y aún necesitan ayuda
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {urgent.map(c => (
                                <CampaignCard key={c.id} campaign={c} accent="red" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Casi conseguidas */}
                {almostDone.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-2xl">🌟</span>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    ¡Casi lo conseguimos!
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Un pequeño empujón y llegamos al objetivo
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {almostDone.map(c => (
                                <CampaignCard key={c.id} campaign={c} accent="green" />
                            ))}
                        </div>
                    </section>
                )}

                {/* En curso */}
                {ongoing.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-2xl">💛</span>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    En curso
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Todas las contribuciones suman
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {ongoing.map(c => (
                                <CampaignCard key={c.id} campaign={c} accent="indigo" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Sin campañas */}
                {campaigns.length === 0 && (
                    <div className="text-center py-20">
                        <span className="text-5xl">💰</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No hay campañas activas en este momento
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
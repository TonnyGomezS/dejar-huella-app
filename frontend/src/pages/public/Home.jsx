import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const ageLabels = {
    puppy:  'Cachorro',
    kitten: 'Gatito',
    adult:  'Adulto',
    senior: 'Senior',
}

export default function Home() {
    const [animals, setAnimals]     = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [animalsRes, campaignsRes] = await Promise.all([
                api.get('/animals?per_page=6'),
                api.get('/campaigns/near-goal'),
            ])
            setAnimals(animalsRes.data.data?.data || animalsRes.data.data || [])
            setCampaigns(campaignsRes.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">🐾</div>
                    <div className="absolute top-20 right-20 text-8xl">🐕</div>
                    <div className="absolute bottom-10 left-1/3 text-9xl">🐈</div>
                    <div className="absolute bottom-20 right-10 text-7xl">🐾</div>
                </div>
                <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        🐾 Conectando animales con familias
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Cada animal merece<br />
                        <span className="text-yellow-300">una segunda oportunidad</span>
                    </h1>
                    <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                        Encuentra a tu compañero ideal entre cientos de animales en protectoras de toda España.
                        Adopta, acoge o apadrina.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/animals?species=dog"
                            className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors text-lg shadow-lg"
                        >
                            🐕 Explorar perros
                        </Link>
                        <Link
                            to="/animals?species=cat"
                            className="flex items-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors text-lg border border-white/30"
                        >
                            🐈 Explorar gatos
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Cómo funciona ── */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800">¿Cómo funciona?</h2>
                        <p className="text-gray-500 mt-3">
                            Encontrar a tu compañero ideal es muy sencillo
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                step:  '01',
                                icon:  '🔍',
                                title: 'Busca',
                                desc:  'Explora perros y gatos disponibles en protectoras de toda España. Filtra por raza, edad, tamaño y mucho más.',
                                color: 'bg-indigo-50 border-indigo-200',
                                numColor: 'text-indigo-300',
                            },
                            {
                                step:  '02',
                                icon:  '🤝',
                                title: 'Conecta',
                                desc:  'Completa tu perfil de compatibilidad y descubre qué animales encajan mejor con tu estilo de vida.',
                                color: 'bg-emerald-50 border-emerald-200',
                                numColor: 'text-emerald-300',
                            },
                            {
                                step:  '03',
                                icon:  '🏠',
                                title: 'Adopta',
                                desc:  'Envía tu solicitud de adopción, acogida o apadrinamiento directamente a la protectora y dale una nueva vida.',
                                color: 'bg-amber-50 border-amber-200',
                                numColor: 'text-amber-300',
                            },
                        ].map(item => (
                            <div
                                key={item.step}
                                className={'rounded-2xl border p-6 ' + item.color}
                            >
                                <div className={'text-6xl font-black mb-4 ' + item.numColor}>
                                    {item.step}
                                </div>
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Animales disponibles ── */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                Esperando un hogar
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Estos animales están listos para encontrar familia
                            </p>
                        </div>
                        <Link
                            to="/animals"
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Ver todos →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <span className="text-5xl animate-bounce inline-block">🐾</span>
                            <p className="text-gray-400 mt-2">Cargando animales...</p>
                        </div>
                    ) : animals.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-5xl">🐾</span>
                            <p className="text-gray-500 mt-3">No hay animales disponibles ahora mismo</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
                            {animals.map(animal => (
                                <Link
                                    key={animal.id}
                                    to={'/animals/' + animal.id}
                                    className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                                >
                                    <div className="h-48 bg-gray-100 overflow-hidden">
                                        {animal.image_url ? (
                                            <img
                                                src={animal.image_url}
                                                alt={animal.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {animal.species === 'dog' ? '🐕' : '🐈'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-gray-800">
                                                {animal.name}
                                            </h3>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                                {ageLabels[animal.age_range] || animal.age_range}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {animal.breed || (animal.species === 'dog' ? 'Perro' : 'Gato')}
                                        </p>
                                        {animal.shelter?.name && (
                                            <p className="text-xs text-gray-400 mt-1 truncate">
                                                🏠 {animal.shelter.name}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Campañas ── */}
            {!loading && campaigns.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Campañas que necesitan tu ayuda
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    Pequeñas donaciones hacen grandes diferencias
                                </p>
                            </div>
                            <Link
                                to="/campaigns"
                                className="text-sm font-medium text-violet-600 hover:underline"
                            >
                                Ver todas →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {campaigns.slice(0, 3).map(campaign => {
                                const progress = campaign.progress_percent || 0
                                return (
                                    <Link
                                        key={campaign.id}
                                        to={'/campaigns/' + campaign.id}
                                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                                    >
                                        <div className="h-36 bg-gray-100 overflow-hidden">
                                            {campaign.animal?.image_url ? (
                                                <img
                                                    src={campaign.animal.image_url}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-200">
                                                    <span className="text-5xl opacity-40">💛</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                                                {campaign.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-3">
                                                🏠 {campaign.shelter?.name}
                                            </p>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                                <div
                                                    className="bg-violet-500 h-1.5 rounded-full transition-all"
                                                    style={{ width: Math.min(progress, 100) + '%' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span className="font-medium text-violet-600">
                                                    {progress}% conseguido
                                                </span>
                                                <span>
                                                    {campaign.raised_amount || 0}€ de {campaign.goal_amount}€
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA Protectoras ── */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl p-12 text-center text-white">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-3xl font-bold mb-4">
                            ¿Tienes una protectora?
                        </h2>
                        <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
                            Únete a Deja tu Huella y conecta con miles de familias que buscan dar un hogar a un animal.
                            Publica tus animales, organiza eventos y lanza campañas de recaudación.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                to="/shelter/register"
                                className="bg-white text-amber-600 font-bold px-8 py-4 rounded-2xl hover:bg-amber-50 transition-colors text-lg shadow-lg"
                            >
                                Registrar mi protectora
                            </Link>
                            <Link
                                to="/shelter/login"
                                className="bg-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors text-lg border border-white/30"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
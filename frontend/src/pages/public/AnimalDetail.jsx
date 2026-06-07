import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const statusConfig = {
    available:        { label: 'Disponible',    color: 'bg-green-100 text-green-700'   },
    under_evaluation: { label: 'En evaluación', color: 'bg-yellow-100 text-yellow-700' },
    reserved:         { label: 'Reservado',     color: 'bg-purple-100 text-purple-700' },
    fostered:         { label: 'En acogida',    color: 'bg-blue-100 text-blue-700'     },
    adopted:          { label: 'Adoptado',      color: 'bg-gray-100 text-gray-500'     },
}

const ageLabels = {
    puppy:  'Cachorro',
    kitten: 'Gatito',
    adult:  'Adulto',
    senior: 'Senior',
}

const sizeLabels = {
    small:  'Pequeño',
    medium: 'Mediano',
    large:  'Grande',
}

const activityLabels = {
    low:    'Bajo',
    medium: 'Medio',
    high:   'Alto',
}

const hoursAloneLabels = {
    less_than_4:     'Menos de 4h',
    between_4_and_8: 'Entre 4 y 8h',
    more_than_8:     'Más de 8h',
}

const companionLabels = {
    independent:  'Independiente',
    balanced:     'Equilibrado',
    affectionate: 'Muy cariñoso',
}

const requestTypes = [
    { value: 'adoption',    label: 'Solicitar adopción',      icon: '🏠', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { value: 'fostering',   label: 'Solicitar acogida',       icon: '🤝', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { value: 'sponsorship', label: 'Apadrinar',               icon: '💛', color: 'bg-amber-500 hover:bg-amber-600' },
]

export default function AnimalDetail() {
    const { id }       = useParams()
    const navigate     = useNavigate()
    const { token }    = useAuth()

    const [animal, setAnimal]       = useState(null)
    const [loading, setLoading]     = useState(true)
    const [requesting, setRequesting] = useState(null)
    const [success, setSuccess]     = useState(null)
    const [error, setError]         = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedType, setSelectedType] = useState(null)
    const [message, setMessage]     = useState('')

    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                const { data } = await api.get(`/animals/${id}`)
                setAnimal(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchAnimal()
    }, [id])

    const handleRequest = async () => {
        if (!selectedType) return
        setRequesting(selectedType)
        setError(null)
        try {
            await api.post(`/animals/${id}/requests`, {
                type:    selectedType,
                message: message,
            })
            setSuccess(selectedType)
            setShowModal(false)
            setMessage('')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar la solicitud')
        } finally {
            setRequesting(null)
        }
    }

    const openModal = (type) => {
        setSelectedType(type)
        setShowModal(true)
        setError(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">🐾</span>
                    <p className="text-gray-400 mt-2">Cargando...</p>
                </div>
            </div>
        )
    }

    if (!animal) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl">🔍</span>
                    <p className="text-gray-500 mt-3">Animal no encontrado</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 text-sm text-indigo-600 hover:underline"
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        )
    }

    const status       = statusConfig[animal.status] || statusConfig.available
    const isAvailable  = animal.status === 'available'

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera con foto */}
            <div className="relative h-80 bg-gray-200">
                {animal.image_url ? (
                    <img
                        src={animal.image_url}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100">
                        <span className="text-9xl opacity-30">
                            {animal.species === 'dog' ? '🐕' : '🐈'}
                        </span>
                    </div>
                )}

                {/* Overlay degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Info sobre la foto */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-4xl mx-auto flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                    {status.label}
                                </span>
                                <span className="text-white/70 text-sm">
                                    {animal.species === 'dog' ? '🐕 Perro' : '🐈 Gato'}
                                    {' · '}
                                    {animal.gender === 'male' ? '♂ Macho' : '♀ Hembra'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold">{animal.name}</h1>
                            <p className="text-white/80 mt-1">
                                {animal.breed || (animal.species === 'dog' ? 'Perro mestizo' : 'Gato mestizo')}
                                {' · '}
                                {ageLabels[animal.age_range] || animal.age_range}
                                {animal.size && ` · ${sizeLabels[animal.size]}`}
                            </p>
                        </div>

                        {/* Botón volver */}
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white/80 hover:text-white text-sm transition-colors"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna principal */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Descripción */}
                        {animal.description && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">
                                    Sobre {animal.name}
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {animal.description}
                                </p>
                            </div>
                        )}

                        {/* Comportamiento social */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                Convivencia
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${animal.good_with_kids ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">👶</span>
                                    <span className="text-xs font-medium text-gray-700">Con niños</span>
                                    <span className={`text-xs font-bold ${animal.good_with_kids ? 'text-green-600' : 'text-gray-400'}`}>
                                        {animal.good_with_kids ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${animal.good_with_cats ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🐈</span>
                                    <span className="text-xs font-medium text-gray-700">Con gatos</span>
                                    <span className={`text-xs font-bold ${animal.good_with_cats ? 'text-green-600' : 'text-gray-400'}`}>
                                        {animal.good_with_cats ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${animal.good_with_dogs ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🐕</span>
                                    <span className="text-xs font-medium text-gray-700">Con perros</span>
                                    <span className={`text-xs font-bold ${animal.good_with_dogs ? 'text-green-600' : 'text-gray-400'}`}>
                                        {animal.good_with_dogs ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${animal.good_with_strangers ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🧑</span>
                                    <span className="text-xs font-medium text-gray-700">Con extraños</span>
                                    <span className={`text-xs font-bold ${animal.good_with_strangers ? 'text-green-600' : 'text-gray-400'}`}>
                                        {animal.good_with_strangers ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            </div>

                            {animal.special_needs && (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                                    <span className="text-xl">❤️</span>
                                    <p className="text-sm text-rose-700 font-medium">
                                        Este animal tiene necesidades especiales. Contacta con la protectora para más información.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Características específicas */}
                        {animal.species === 'dog' && (animal.size || animal.activity_level || animal.max_hours_alone) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Características
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {animal.size && (
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-1">Tamaño</p>
                                            <p className="font-semibold text-gray-800">{sizeLabels[animal.size]}</p>
                                        </div>
                                    )}
                                    {animal.activity_level && (
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-1">Actividad</p>
                                            <p className="font-semibold text-gray-800">{activityLabels[animal.activity_level]}</p>
                                        </div>
                                    )}
                                    {animal.max_hours_alone && (
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-1">Máx. solo</p>
                                            <p className="font-semibold text-gray-800">{hoursAloneLabels[animal.max_hours_alone]}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {animal.species === 'cat' && (animal.cat_companion_type || animal.indoor_only !== null) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Características
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {animal.cat_companion_type && (
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-1">Personalidad</p>
                                            <p className="font-semibold text-gray-800">{companionLabels[animal.cat_companion_type]}</p>
                                        </div>
                                    )}
                                    {animal.indoor_only !== null && (
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-1">Exterior</p>
                                            <p className="font-semibold text-gray-800">{animal.indoor_only ? 'Solo interior' : 'Interior y exterior'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Campañas asociadas */}
                        {animal.campaigns?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Campañas activas
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {animal.campaigns.map(campaign => (
                                        <Link
                                            key={campaign.id}
                                            to={`/campaigns/${campaign.id}`}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{campaign.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {campaign.raised_amount || 0}€ recaudados de {campaign.goal_amount}€
                                                </p>
                                            </div>
                                            <span className="text-indigo-600 text-sm">→</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="flex flex-col gap-5">

                        {/* Protectora */}
                        {animal.shelter && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Protectora
                                </h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        🏠
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{animal.shelter.name}</p>
                                        {animal.shelter.location && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                📍 {animal.shelter.location.municipality}, {animal.shelter.location.province}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {animal.shelter.phone && (
                                    <p className="text-sm text-gray-500 mb-3">
                                        📞 {animal.shelter.phone}
                                    </p>
                                )}
                                <Link
                                    to={`/shelters/${animal.shelter.id}`}
                                    className="block text-center text-sm border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium py-2 rounded-xl transition-colors"
                                >
                                    Ver protectora
                                </Link>
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                ¿Quieres ayudar a {animal.name}?
                            </h3>

                            {success ? (
                                <div className="text-center py-4">
                                    <span className="text-4xl">✅</span>
                                    <p className="text-sm font-medium text-green-700 mt-2">
                                        ¡Solicitud enviada correctamente!
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        La protectora revisará tu solicitud pronto
                                    </p>
                                </div>
                            ) : !token ? (
                                <div className="text-center py-2">
                                    <p className="text-sm text-gray-500 mb-3">
                                        Inicia sesión para enviar una solicitud
                                    </p>
                                    <Link
                                        to="/login"
                                        className="block text-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                    >
                                        Iniciar sesión
                                    </Link>
                                </div>
                            ) : !isAvailable ? (
                                <div className="text-center py-4">
                                    <span className="text-3xl">😔</span>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Este animal no está disponible actualmente
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {requestTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => openModal(type.value)}
                                            disabled={!!requesting}
                                            className={`flex items-center gap-2 justify-center text-sm text-white font-medium py-2.5 rounded-xl transition-colors ${type.color}`}
                                        >
                                            <span>{type.icon}</span>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de solicitud */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            {requestTypes.find(t => t.value === selectedType)?.label}
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Estás solicitando {selectedType === 'adoption' ? 'adoptar' : selectedType === 'fostering' ? 'acoger' : 'apadrinar'} a {animal.name}.
                            La protectora recibirá tu solicitud y se pondrá en contacto contigo.
                        </p>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mensaje para la protectora
                                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Cuéntanos sobre tu situación, tu hogar, experiencia con animales..."
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRequest}
                                disabled={!!requesting}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {requesting ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const typeConfig = {
    adoption_day:      { label: 'Jornada de adopción',     color: 'bg-indigo-100 text-indigo-700',   icon: '🐾' },
    solidarity_market: { label: 'Mercadillo solidario',    color: 'bg-emerald-100 text-emerald-700', icon: '🛍️' },
    open_day:          { label: 'Puertas abiertas',        color: 'bg-amber-100 text-amber-700',     icon: '🏠' },
    volunteering:      { label: 'Voluntariado',            color: 'bg-rose-100 text-rose-700',       icon: '🙋' },
    collective_walk:   { label: 'Paseo colectivo',         color: 'bg-sky-100 text-sky-700',         icon: '🦮' },
    fundraising:       { label: 'Recaudación de fondos',   color: 'bg-violet-100 text-violet-700',   icon: '💰' },
    awareness_talk:    { label: 'Charla de concienciación', color: 'bg-orange-100 text-orange-700',  icon: '🎤' },
}

const ageLabels = {
    puppy:  'Cachorro',
    kitten: 'Gatito',
    adult:  'Adulto',
    senior: 'Senior',
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return {
        day:   date.getDate(),
        month: date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        time:  date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    }
}

export default function ShelterDetail() {
    const { id }     = useParams()
    const navigate   = useNavigate()
    const { token }  = useAuth()

    const [shelter, setShelter]           = useState(null)
    const [animals, setAnimals]           = useState([])
    const [events, setEvents]             = useState([])
    const [loading, setLoading]           = useState(true)
    const [showVolunteerModal, setShowVolunteerModal] = useState(false)
    const [volunteerForm, setVolunteerForm] = useState({
        availability: '',
        interests:    '',
        message:      '',
    })
    const [sending, setSending]   = useState(false)
    const [success, setSuccess]   = useState(false)
    const [error, setError]       = useState(null)

    useEffect(() => {
        fetchShelter()
    }, [id])

    const fetchShelter = async () => {
        setLoading(true)
        try {
            const [shelterRes, animalsRes, eventsRes] = await Promise.all([
                api.get('/shelters/' + id),
                api.get('/animals?shelter_id=' + id + '&status=available'),
                api.get('/events?shelter_id=' + id),
            ])
            setShelter(shelterRes.data)
            setAnimals(animalsRes.data.data?.data || animalsRes.data.data || [])
            setEvents(eventsRes.data.data?.data || eventsRes.data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleVolunteer = async () => {
        setError(null)
        if (!volunteerForm.availability) return setError('Indica tu disponibilidad')
        if (!volunteerForm.interests)    return setError('Indica tus intereses')

        setSending(true)
        try {
            await api.post('/shelters/' + id + '/volunteer', volunteerForm)
            setSuccess(true)
            setShowVolunteerModal(false)
        } catch (e) {
            setError(e.response?.data?.message || 'Error al enviar la solicitud')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">🏠</span>
                    <p className="text-gray-400 mt-2">Cargando protectora...</p>
                </div>
            </div>
        )
    }

    if (!shelter) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl">🔍</span>
                    <p className="text-gray-500 mt-3">Protectora no encontrada</p>
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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 text-white py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white/70 hover:text-white text-sm mb-4 block transition-colors"
                    >
                        ← Volver
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0">
                            {shelter.image_url ? (
                                <img
                                    src={shelter.image_url}
                                    alt={shelter.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                    🏠
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{shelter.name}</h1>
                            {shelter.location && (
                                <p className="text-amber-100 mt-1">
                                    📍 {shelter.location.municipality}, {shelter.location.province}
                                </p>
                            )}
                            {shelter.phone && (
                                <p className="text-amber-100 text-sm mt-0.5">
                                    📞 {shelter.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna principal */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Descripción */}
                        {shelter.description && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">
                                    Sobre nosotros
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {shelter.description}
                                </p>
                            </div>
                        )}

                        {/* Animales disponibles */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Animales disponibles
                                </h2>
                                <Link
                                    to={'/animals?shelter_id=' + id}
                                    className="text-sm text-amber-600 hover:underline font-medium"
                                >
                                    Ver todos
                                </Link>
                            </div>

                            {animals.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl">🐾</span>
                                    <p className="text-gray-400 mt-2 text-sm">
                                        No hay animales disponibles ahora mismo
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {animals.slice(0, 6).map(animal => (
                                        <Link
                                            key={animal.id}
                                            to={'/animals/' + animal.id}
                                            className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
                                        >
                                            <div className="h-28 bg-gray-100">
                                                {animal.image_url ? (
                                                    <img
                                                        src={animal.image_url}
                                                        alt={animal.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">
                                                        {animal.species === 'dog' ? '🐕' : '🐈'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {animal.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {animal.breed || (animal.species === 'dog' ? 'Perro' : 'Gato')}
                                                    {' · '}
                                                    {ageLabels[animal.age_range] || animal.age_range}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Próximos eventos */}
                        {events.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-5">
                                    Próximos eventos
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {events.slice(0, 3).map(event => {
                                        const date = formatDate(event.event_date)
                                        const type = typeConfig[event.type] || { label: event.type, color: 'bg-gray-100 text-gray-600', icon: '📅' }
                                        return (
                                            <div
                                                key={event.id}
                                                className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="w-12 h-12 flex-shrink-0 flex flex-col items-center justify-center bg-amber-50 rounded-xl">
                                                    <span className="text-xs font-bold text-amber-500 uppercase">{date.month}</span>
                                                    <span className="text-lg font-bold text-amber-700 leading-none">{date.day}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 text-sm truncate">
                                                        {event.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={'text-xs px-2 py-0.5 rounded-full ' + type.color}>
                                                            {type.icon} {type.label}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {date.time}h · {event.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="flex flex-col gap-5">

                        {/* Acciones */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                ¿Quieres colaborar?
                            </h3>

                            {success ? (
                                <div className="text-center py-4">
                                    <span className="text-4xl">✅</span>
                                    <p className="text-sm font-medium text-green-700 mt-2">
                                        ¡Solicitud enviada!
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        La protectora revisará tu solicitud pronto
                                    </p>
                                </div>
                            ) : !token ? (
                                <div className="text-center py-2">
                                    <p className="text-sm text-gray-500 mb-3">
                                        Inicia sesión para colaborar
                                    </p>
                                    <Link
                                        to="/login"
                                        className="block text-center text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition-colors"
                                    >
                                        Iniciar sesión
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to={'/animals?shelter_id=' + id}
                                        className="flex items-center gap-2 justify-center text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition-colors"
                                    >
                                        🐾 Adoptar un animal
                                    </Link>
                                    <button
                                        onClick={() => setShowVolunteerModal(true)}
                                        className="flex items-center gap-2 justify-center text-sm border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium py-2.5 rounded-xl transition-colors"
                                    >
                                        🙋 Ser voluntario
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                En números
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">🐾 Animales disponibles</span>
                                    <span className="font-bold text-gray-800">{animals.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">📅 Eventos próximos</span>
                                    <span className="font-bold text-gray-800">{events.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal voluntariado */}
            {showVolunteerModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            Solicitar voluntariado
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            en {shelter.name}
                        </p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Disponibilidad <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { value: 'mornings',   label: 'Mañanas',          icon: '🌅' },
                                        { value: 'afternoons', label: 'Tardes',           icon: '🌇' },
                                        { value: 'weekends',   label: 'Fines de semana',  icon: '📅' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setVolunteerForm(prev => ({ ...prev, availability: opt.value }))}
                                            className={'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ' + (
                                                volunteerForm.availability === opt.value
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                            )}
                                        >
                                            <span>{opt.icon}</span>
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Intereses <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={volunteerForm.interests}
                                    onChange={e => setVolunteerForm(prev => ({ ...prev, interests: e.target.value }))}
                                    placeholder="Ej: paseos, cuidados, eventos, redes sociales..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mensaje
                                    <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                                </label>
                                <textarea
                                    value={volunteerForm.message}
                                    onChange={e => setVolunteerForm(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Cuéntanos sobre ti y por qué quieres colaborar..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
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
                                    setShowVolunteerModal(false)
                                    setError(null)
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleVolunteer}
                                disabled={sending}
                                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {sending ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
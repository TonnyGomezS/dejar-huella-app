import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function ShelterList() {
    const { token } = useAuth()

    const [shelters, setShelters] = useState([])
    const [loading, setLoading]   = useState(true)
    const [search, setSearch]     = useState('')
    const [filters, setFilters]   = useState({
        autonomous_community: '',
        province: '',
    })

    const [volunteerModal, setVolunteerModal] = useState(null)
    const [volunteerForm, setVolunteerForm]   = useState({
        availability: '',
        interests:    '',
        message:      '',
    })
    const [sending, setSending]   = useState(false)
    const [success, setSuccess]   = useState(false)
    const [error, setError]       = useState(null)

    useEffect(() => {
        fetchShelters()
    }, [filters])

    const fetchShelters = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.autonomous_community) params.append('autonomous_community', filters.autonomous_community)
            if (filters.province)             params.append('province', filters.province)

            const { data } = await api.get('/shelters?' + params.toString())
            setShelters(data.data || data || [])
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
            await api.post('/shelters/' + volunteerModal.id + '/volunteer', volunteerForm)
            setSuccess(true)
        } catch (e) {
            setError(e.response?.data?.message || 'Error al enviar la solicitud')
        } finally {
            setSending(false)
        }
    }

    const handleOpenModal = (shelter) => {
        setVolunteerModal(shelter)
        setVolunteerForm({ availability: '', interests: '', message: '' })
        setSuccess(false)
        setError(null)
    }

    const handleCloseModal = () => {
        setVolunteerModal(null)
        setSuccess(false)
        setError(null)
    }

    const filteredShelters = shelters.filter(shelter =>
        shelter.name.toLowerCase().includes(search.toLowerCase()) ||
        shelter.address?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 text-white py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        🏠 Protectoras
                    </h1>
                    <p className="text-white/80">
                        Encuentra protectoras cerca de ti y descubre cómo colaborar
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Buscador */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o dirección..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <select
                        value={filters.autonomous_community}
                        onChange={e => setFilters({ ...filters, autonomous_community: e.target.value, province: '' })}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                        <option value="">Todas las comunidades</option>
                        <option value="Comunidad de Madrid">Madrid</option>
                        <option value="Cataluña">Cataluña</option>
                        <option value="Comunidad Valenciana">C. Valenciana</option>
                        <option value="Andalucía">Andalucía</option>
                        <option value="País Vasco">País Vasco</option>
                        <option value="Galicia">Galicia</option>
                        <option value="Castilla y León">Castilla y León</option>
                        <option value="Castilla-La Mancha">Castilla-La Mancha</option>
                        <option value="Aragón">Aragón</option>
                        <option value="Extremadura">Extremadura</option>
                        <option value="Principado de Asturias">Asturias</option>
                        <option value="Región de Murcia">Murcia</option>
                        <option value="Islas Baleares">Baleares</option>
                        <option value="Canarias">Canarias</option>
                        <option value="Cantabria">Cantabria</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="Navarra">Navarra</option>
                    </select>
                </div>

                {/* Resultados */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <span className="text-4xl animate-bounce inline-block">🏠</span>
                            <p className="text-gray-400 mt-2">Buscando protectoras...</p>
                        </div>
                    </div>
                ) : filteredShelters.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">🔍</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No encontramos protectoras con estos filtros
                        </p>
                        <button
                            onClick={() => {
                                setSearch('')
                                setFilters({ autonomous_community: '', province: '' })
                            }}
                            className="mt-4 text-sm text-amber-600 hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredShelters.map(shelter => (
                            <div
                                key={shelter.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
                            >
                                {/* Imagen */}
                                <div className="h-40 bg-amber-50 relative">
                                    {shelter.image_url ? (
                                        <img
                                            src={shelter.image_url}
                                            alt={shelter.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl">
                                            🏠
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                                        {shelter.name}
                                    </h3>

                                    {shelter.location && (
                                        <p className="text-sm text-gray-500 mb-2">
                                            📍 {shelter.location.municipality}, {shelter.location.province}
                                        </p>
                                    )}

                                    {shelter.description && (
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                            {shelter.description}
                                        </p>
                                    )}

                                    {shelter.phone && (
                                        <p className="text-sm text-gray-500 mb-4">
                                            📞 {shelter.phone}
                                        </p>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to={'/shelters/' + shelter.id}
                                            className="block text-center text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition-colors"
                                        >
                                            Ver protectora
                                        </Link>

                                        {token && (
                                            <button
                                                onClick={() => handleOpenModal(shelter)}
                                                className="block w-full text-center text-sm border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium py-2.5 rounded-xl transition-colors"
                                            >
                                                🙋 Ser voluntario
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal voluntariado */}
            {volunteerModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">

                        {success ? (
                            <div className="text-center py-6">
                                <span className="text-5xl">✅</span>
                                <h3 className="font-bold text-gray-800 text-lg mt-4 mb-2">
                                    ¡Solicitud enviada!
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    La protectora {volunteerModal.name} revisará tu solicitud pronto.
                                </p>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">
                                    Solicitar voluntariado
                                </h3>
                                <p className="text-sm text-gray-500 mb-5">
                                    en {volunteerModal.name}
                                </p>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Disponibilidad <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { value: 'mornings',   label: 'Mañanas',         icon: '🌅' },
                                                { value: 'afternoons', label: 'Tardes',           icon: '🌇' },
                                                { value: 'weekends',   label: 'Fines de semana', icon: '📅' },
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
                                        onClick={handleCloseModal}
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
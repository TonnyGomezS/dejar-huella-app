import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const speciesConfig = {
    dog: { label: 'Perros', icon: '🐕', color: 'indigo' },
    cat: { label: 'Gatos',  icon: '🐈', color: 'violet' },
}

const sizeLabels = {
    small:  'Pequeño',
    medium: 'Mediano',
    large:  'Grande',
}

const ageLabels = {
    puppy:  'Cachorro',
    kitten: 'Gatito',
    adult:  'Adulto',
    senior: 'Senior',
}

const compatibilityConfig = {
    0:  { label: 'Incompatibilidad total', color: 'bg-red-100 text-red-700'      },
    39: { label: 'Compatibilidad baja',    color: 'bg-orange-100 text-orange-700' },
    69: { label: 'Compatibilidad media',   color: 'bg-yellow-100 text-yellow-700' },
    100:{ label: 'Compatibilidad alta',    color: 'bg-green-100 text-green-700'   },
}

function getCompatibilityStyle(score) {
    if (score === 0)  return compatibilityConfig[0]
    if (score <= 39)  return compatibilityConfig[39]
    if (score <= 69)  return compatibilityConfig[69]
    return compatibilityConfig[100]
}

export default function AnimalList() {
    const { token } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialSpecies = searchParams.get('species') || ''

    const [animals, setAnimals]       = useState([])
    const [hasProfile, setHasProfile] = useState(false)
    const [loading, setLoading]       = useState(true)
    const [filters, setFilters]       = useState({
        species:   initialSpecies,
        age_range: '',
        size:      '',
        good_with_kids: '',
    })

    useEffect(() => {
        fetchAnimals()
    }, [filters])

    const fetchAnimals = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.species)        params.append('species',        filters.species)
            if (filters.age_range)      params.append('age_range',      filters.age_range)
            if (filters.size)           params.append('size',           filters.size)
            if (filters.good_with_kids) params.append('good_with_kids', filters.good_with_kids)

            const headers = token
                ? { Authorization: `Bearer ${token}` }
                : {}

            const { data } = await api.get(`/animals?${params.toString()}`, { headers })

            setHasProfile(data.has_profile || false)
            setAnimals(data.data?.data || data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        if (key === 'species') {
            setSearchParams(value ? { species: value } : {})
        }
    }

    const currentSpecies = speciesConfig[filters.species]

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className={`bg-gradient-to-r ${filters.species === 'cat' ? 'from-violet-600 to-purple-400' : 'from-indigo-600 to-blue-400'} text-white py-10`}>
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        {currentSpecies
                            ? `${currentSpecies.icon} ${currentSpecies.label} en adopción`
                            : '🐾 Todos los animales'
                        }
                    </h1>
                    <p className="text-white/80">
                        {hasProfile
                            ? 'Resultados ordenados por compatibilidad con tu perfil'
                            : 'Encuentra a tu compañero ideal'
                        }
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Filtros de especie */}
                <div className="flex gap-3 mb-6">
                    {[
                        { value: '',    label: 'Todos',  icon: '🐾' },
                        { value: 'dog', label: 'Perros', icon: '🐕' },
                        { value: 'cat', label: 'Gatos',  icon: '🐈' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFilter('species', opt.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                filters.species === opt.value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                            }`}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-8">

                    {/* Panel de filtros lateral */}
                    <aside className="w-56 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
                            <h3 className="font-semibold text-gray-800 mb-4">Filtros</h3>

                            {/* Edad */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Edad
                                </label>
                                <select
                                    value={filters.age_range}
                                    onChange={e => handleFilter('age_range', e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Cualquier edad</option>
                                    {filters.species !== 'cat' && <option value="puppy">Cachorro</option>}
                                    {filters.species !== 'dog' && <option value="kitten">Gatito</option>}
                                    <option value="adult">Adulto</option>
                                    <option value="senior">Senior</option>
                                </select>
                            </div>

                            {/* Tamaño (solo perros) */}
                            {filters.species !== 'cat' && (
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Tamaño
                                    </label>
                                    <select
                                        value={filters.size}
                                        onChange={e => handleFilter('size', e.target.value)}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Cualquier tamaño</option>
                                        <option value="small">Pequeño</option>
                                        <option value="medium">Mediano</option>
                                        <option value="large">Grande</option>
                                    </select>
                                </div>
                            )}

                            {/* Compatible con niños */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Compatible con niños
                                </label>
                                <select
                                    value={filters.good_with_kids}
                                    onChange={e => handleFilter('good_with_kids', e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Indiferente</option>
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </div>

                            {/* Banner perfil de compatibilidad */}
                            {token && !hasProfile && filters.species && (
                                <div className="mt-4 bg-indigo-50 rounded-xl p-4 text-center">
                                    <span className="text-2xl">🐾</span>
                                    <p className="text-xs text-indigo-700 font-medium mt-2 mb-3">
                                        Completa tu perfil para ver resultados ordenados por compatibilidad
                                    </p>
                                    <Link
                                        to="/dashboard/compatibility"
                                        className="block text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        Completar perfil
                                    </Link>
                                </div>
                            )}

                            {hasProfile && (
                                <div className="mt-4 bg-green-50 rounded-xl p-4 text-center">
                                    <span className="text-xl">✅</span>
                                    <p className="text-xs text-green-700 font-medium mt-2">
                                        Resultados ordenados por compatibilidad
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Grid de animales */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <span className="text-4xl animate-bounce inline-block">🐾</span>
                                    <p className="text-gray-400 mt-2">Buscando animales...</p>
                                </div>
                            </div>
                        ) : animals.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-5xl">🔍</span>
                                <p className="text-gray-500 mt-3 font-medium">
                                    No encontramos animales con estos filtros
                                </p>
                                <button
                                    onClick={() => setFilters({ species: filters.species, age_range: '', size: '', good_with_kids: '' })}
                                    className="mt-4 text-sm text-indigo-600 hover:underline"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {animals.map(item => {
                                    const animal = item.animal || item
                                    const score  = item.compatibility

                                    return (
                                        <div
                                            key={animal.id}
                                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
                                        >
                                            {/* Foto */}
                                            <div className="h-48 bg-gray-100 relative">
                                                {animal.image_url ? (
                                                    <img
                                                        src={animal.image_url}
                                                        alt={animal.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-5xl">
                                                        {animal.species === 'dog' ? '🐕' : '🐈'}
                                                    </div>
                                                )}

                                                {/* Badge compatibilidad */}
                                                {score !== undefined && (
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${getCompatibilityStyle(score).color}`}>
                                                            {score}% {getCompatibilityStyle(score).label}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Badge especie */}
                                                <div className="absolute top-3 left-3">
                                                    <span className="text-lg bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                                                        {animal.species === 'dog' ? '🐕' : '🐈'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="font-bold text-gray-800 text-lg">
                                                        {animal.name}
                                                    </h3>
                                                    {animal.gender && (
                                                        <span className="text-gray-400 text-sm">
                                                            {animal.gender === 'male' ? '♂' : '♀'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {animal.breed || (animal.species === 'dog' ? 'Perro' : 'Gato')}
                                                    {' · '}
                                                    {ageLabels[animal.age_range] || animal.age_range}
                                                    {animal.size && ` · ${sizeLabels[animal.size]}`}
                                                </p>

                                                {/* Badges compatibilidad */}
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {animal.good_with_kids && (
                                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                            👶 Con niños
                                                        </span>
                                                    )}
                                                    {animal.good_with_dogs && (
                                                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                                                            🐕 Con perros
                                                        </span>
                                                    )}
                                                    {animal.good_with_cats && (
                                                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                                                            🐈 Con gatos
                                                        </span>
                                                    )}
                                                    {animal.special_needs && (
                                                        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                                            ❤️ Necesidades especiales
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Protectora */}
                                                <p className="text-xs text-gray-400 mb-3">
                                                    📍 {animal.shelter?.name || '—'}
                                                    {animal.shelter?.location && (
                                                        <span> · {animal.shelter.location.municipality}</span>
                                                    )}
                                                </p>

                                                <Link
                                                    to={`/animals/${animal.id}`}
                                                    className="block text-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                                >
                                                    ¡Conóceme!
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
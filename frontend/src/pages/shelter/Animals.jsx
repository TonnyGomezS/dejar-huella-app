import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const statusConfig = {
    available:        { label: 'Disponible',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
    under_evaluation: { label: 'En evaluación', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    reserved:         { label: 'Reservado',     color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    fostered:         { label: 'En acogida',    color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
    adopted:          { label: 'Adoptado',      color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'   },
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

export default function ShelterAnimals() {
    const { shelterToken } = useShelter()

    const [animals, setAnimals]         = useState([])
    const [loading, setLoading]         = useState(true)
    const [view, setView]               = useState('cards')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterSpecies, setFilterSpecies] = useState('')
    const [deletingId, setDeletingId]   = useState(null)
    const [statusModal, setStatusModal] = useState(null)

    useEffect(() => {
        fetchAnimals()
    }, [filterStatus, filterSpecies])

    const fetchAnimals = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterStatus)  params.append('status',  filterStatus)
            if (filterSpecies) params.append('species', filterSpecies)

            const { data } = await api.get(`/animals?${params.toString()}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setAnimals(data.data?.data || data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (animalId) => {
        if (!confirm('¿Seguro que quieres eliminar este animal?')) return
        setDeletingId(animalId)
        try {
            await api.delete(`/animals/${animalId}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setAnimals(prev => prev.filter(a => a.id !== animalId))
        } catch (e) {
            console.error(e)
        } finally {
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (animalId, newStatus) => {
        try {
            await api.patch(`/animals/${animalId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${shelterToken}` } }
            )
            setAnimals(prev => prev.map(a =>
                a.id === animalId ? { ...a, status: newStatus } : a
            ))
            setStatusModal(null)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mis animales</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {animals.length} animal{animals.length !== 1 ? 'es' : ''} registrado{animals.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        to="/shelter/animals/create"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                    >
                        <span>+</span> Añadir animal
                    </Link>
                </div>

                {/* Filtros y vista */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">

                    {/* Filtro especie */}
                    <div className="flex gap-2">
                        {[
                            { value: '',    label: 'Todos',  icon: '🐾' },
                            { value: 'dog', label: 'Perros', icon: '🐕' },
                            { value: 'cat', label: 'Gatos',  icon: '🐈' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterSpecies(opt.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                    filterSpecies === opt.value
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                                }`}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Filtro estado */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                filterStatus === ''
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            Todos los estados
                        </button>
                        {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                    filterStatus === key
                                        ? `${config.color} border-current`
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>

                    {/* Toggle vista */}
                    <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setView('cards')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                view === 'cards' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                            }`}
                        >
                            Tarjetas
                        </button>
                        <button
                            onClick={() => setView('table')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                view === 'table' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                            }`}
                        >
                            Tabla
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">🐾</span>
                        <p className="text-gray-400 mt-2">Cargando animales...</p>
                    </div>
                ) : animals.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">🐾</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No hay animales con estos filtros
                        </p>
                        <Link
                            to="/shelter/animals/create"
                            className="mt-4 inline-block text-sm text-amber-600 font-medium hover:underline"
                        >
                            Publicar primer animal
                        </Link>
                    </div>
                ) : view === 'cards' ? (

                    /* Vista tarjetas */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {animals.map(animal => {
                            const status = statusConfig[animal.status] || statusConfig.available
                            return (
                                <div
                                    key={animal.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    {/* Foto */}
                                    <div className="h-44 bg-gray-100 relative">
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
                                        <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-bold text-gray-800 text-lg">{animal.name}</h3>
                                            <span className="text-gray-400 text-sm">
                                                {animal.gender === 'male' ? '♂' : '♀'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {animal.breed || (animal.species === 'dog' ? 'Perro' : 'Gato')}
                                            {' · '}
                                            {ageLabels[animal.age_range] || animal.age_range}
                                            {animal.size && ` · ${sizeLabels[animal.size]}`}
                                        </p>

                                        {/* Acciones */}
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/shelter/animals/${animal.id}/edit`}
                                                className="flex-1 text-center text-sm border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium py-2 rounded-xl transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => setStatusModal(animal)}
                                                className="flex-1 text-center text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-xl transition-colors"
                                            >
                                                Estado
                                            </button>
                                            <button
                                                onClick={() => handleDelete(animal.id)}
                                                disabled={deletingId === animal.id}
                                                className="text-sm border border-red-200 text-red-500 hover:bg-red-50 font-medium px-3 py-2 rounded-xl transition-colors"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                ) : (

                    /* Vista tabla */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                                    <th className="px-5 py-4 font-medium">Animal</th>
                                    <th className="px-5 py-4 font-medium">Especie</th>
                                    <th className="px-5 py-4 font-medium">Edad</th>
                                    <th className="px-5 py-4 font-medium">Tamaño</th>
                                    <th className="px-5 py-4 font-medium">Estado</th>
                                    <th className="px-5 py-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {animals.map(animal => {
                                    const status = statusConfig[animal.status] || statusConfig.available
                                    return (
                                        <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                        {animal.image_url ? (
                                                            <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                                {animal.species === 'dog' ? '🐕' : '🐈'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{animal.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {animal.breed || '—'} · {animal.gender === 'male' ? '♂' : '♀'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {animal.species === 'dog' ? '🐕 Perro' : '🐈 Gato'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {ageLabels[animal.age_range] || animal.age_range}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {animal.size ? sizeLabels[animal.size] : '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/shelter/animals/${animal.id}/edit`}
                                                        className="text-xs border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => setStatusModal(animal)}
                                                        className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Estado
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(animal.id)}
                                                        disabled={deletingId === animal.id}
                                                        className="text-xs border border-red-200 text-red-500 hover:bg-red-50 font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal cambio de estado */}
            {statusModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            Cambiar estado
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {statusModal.name} · {statusModal.species === 'dog' ? 'Perro' : 'Gato'}
                        </p>
                        <div className="flex flex-col gap-2">
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(statusModal.id, key)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                                        statusModal.status === key
                                            ? `${config.color} border-current`
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                                    <span className="text-sm font-medium">{config.label}</span>
                                    {statusModal.status === key && (
                                        <span className="ml-auto text-xs">actual</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStatusModal(null)}
                            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
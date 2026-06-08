import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

// Subcomponente local especializado para homogeneizar la jerarquía visual de los títulos
function SectionTitle({ children }) {
    return (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            {children}
        </h3>
    )
}

// Abstracción reutilizable para campos de formulario, inyectando semántica y control de obligatoriedad
function FormField({ label, required, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    )
}

export default function ShelterCampaignCreate() {
    // Consumo de estados globales mediante Context API para persistencia de credenciales
    const { shelter, shelterToken } = useShelter()
    const navigate = useNavigate()

    // Estado unificado del formulario para evitar la dispersión de hooks useState independientes
    const [form, setForm] = useState({
        title:       '',
        description: '',
        goal_amount: '',
        end_date:    '',
        animal_id:   '',
    })

    const [animals, setAnimals]     = useState([])
    const [error, setError]         = useState(null)
    const [loading, setLoading]     = useState(false)

    // Gancho de ciclo de vida para sincronizar la pasarela de animales disponibles al instanciar el componente
    useEffect(() => {
        fetchAnimals()
    }, [])

    // Petición asíncrona HTTP GET aplicando filtros específicos mediante Query Strings
    const fetchAnimals = async () => {
        try {
            const { data } = await api.get(`/animals?shelter_id=${shelter.id}&status=available`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            // Salvaguarda defensiva para asimilar arrays anidados tanto de respuestas paginadas como crudas
            setAnimals(data.data?.data || data.data || [])
        } catch (e) {
            console.error('Error en la carga de dependencias operacionales:', e)
        }
    }

    // Helper de mutación atómica para actualizar subclaves del estado del formulario preservando la inmutabilidad
    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    // Gestión del envío y validación de datos (Client-side validation)
    const handleSubmit = async () => {
        setError(null)

        // Estrategia de guardas (Early Return) para mitigar peticiones innecesarias al servidor
        if (!form.title)       return setError('El título es obligatorio')
        if (!form.description) return setError('La descripción es obligatoria')
        if (!form.goal_amount) return setError('El objetivo económico es obligatorio')
        if (!form.end_date)    return setError('La fecha de fin es obligatoria')

        setLoading(true)
        try {
            // Envío mutacional POST convirtiendo tipos de datos según las restricciones de la API subyacente
            await api.post('/campaigns', {
                title:       form.title,
                description: form.description,
                goal_amount: parseFloat(form.goal_amount),
                end_date:    form.end_date,
                animal_id:   form.animal_id || null, // Normalización de vacíos a null para integridad relacional
            }, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            // Redirección programática tras persistencia exitosa
            navigate('/shelter/campaigns')
        } catch (err) {
            // Captura resiliente de excepciones priorizando el payload descriptivo del backend
            setError(err.response?.data?.message || 'Error al crear la campaña')
        } finally {
            setLoading(false)
        }
    }

    // Lógica de restricción temporal para impedir el registro de fechas incoherentes en el frontend
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Cabecera de Navegación */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/shelter/campaigns')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Nueva campaña</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Recauda fondos para los animales de tu protectora
                        </p>
                    </div>
                </div>

                {/* Feedback de Errores Operacionales */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-6">

                    {/* Bloque 1: Atributos estructurales de la Campaña */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Información de la campaña</SectionTitle>
                        <div className="flex flex-col gap-5">

                            <FormField label="Título" required>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Ej: Ayuda a Lulú a recuperarse"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Descripción" required>
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Explica para qué se usarán los fondos recaudados..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Objetivo (€)" required>
                                    <input
                                        type="number"
                                        value={form.goal_amount}
                                        onChange={e => set('goal_amount', e.target.value)}
                                        placeholder="Ej: 500"
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </FormField>

                                <FormField label="Fecha de fin" required>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={e => set('end_date', e.target.value)}
                                        min={minDate} // Enlace dinámico para validar restricciones cronológicas
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Bloque 2: Selector Polimórfico de Entidades Relacionadas */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Animal vinculado (opcional)</SectionTitle>
                        <p className="text-sm text-gray-500 mb-4">
                            Puedes vincular esta campaña a uno de tus animales disponibles.
                        </p>

                        {animals.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">
                                No tienes animales disponibles para vincular
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {/* Opción de desvinculación o campaña general de protectora */}
                                <button
                                    type="button"
                                    onClick={() => set('animal_id', '')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-colors ${
                                        form.animal_id === ''
                                            ? 'bg-amber-500 text-white border-amber-500'
                                            : 'border-gray-200 text-gray-500 hover:border-amber-300'
                                    }`}
                                >
                                    <span className="text-2xl">💛</span>
                                    <span className="font-medium text-xs">Sin animal</span>
                                </button>

                                {/* Renderizado dinámico de la colección mediante mapeo asociativo */}
                                {animals.map(animal => (
                                    <button
                                        key={animal.id}
                                        type="button"
                                        onClick={() => set('animal_id', animal.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-colors ${
                                            form.animal_id === animal.id
                                                ? 'bg-amber-500 text-white border-amber-500'
                                                : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                            {animal.image_url ? (
                                                <img
                                                    src={animal.image_url}
                                                    alt={animal.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                /* Fallback de renderizado condicional basado en metadatos del objeto */
                                                <div className="w-full h-full flex items-center justify-center text-lg">
                                                    {animal.species === 'dog' ? '🐕' : '🐈'}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-xs truncate w-full text-center">
                                            {animal.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Barra de Acciones y Control de Bloqueos por Concurrencia */}
                    <div className="flex gap-3 justify-end pb-8">
                        <button
                            onClick={() => navigate('/shelter/campaigns')}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading} // Prevención de Double-Submit mediante control de estado reactivo
                            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            {loading ? 'Creando campaña...' : 'Crear campaña'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
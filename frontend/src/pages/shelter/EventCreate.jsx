import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const typeOptions = [
    { value: 'adoption_day',      label: 'Jornada de adopción',     icon: '🐾' },
    { value: 'solidarity_market', label: 'Mercadillo solidario',    icon: '🛍️' },
    { value: 'open_day',          label: 'Puertas abiertas',        icon: '🏠' },
    { value: 'volunteering',      label: 'Voluntariado',            icon: '🙋' },
    { value: 'collective_walk',   label: 'Paseo colectivo',         icon: '🦮' },
    { value: 'fundraising',       label: 'Recaudación de fondos',   icon: '💰' },
    { value: 'awareness_talk',    label: 'Charla de concienciación', icon: '🎤' },
]

function SectionTitle({ children }) {
    return (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            {children}
        </h3>
    )
}

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

export default function ShelterEventCreate() {
    const { shelterToken } = useShelter()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        title:          '',
        description:    '',
        type:           '',
        event_date:     '',
        event_time:     '',
        location:       '',
        max_volunteers: '',
    })

    const [error, setError]     = useState(null)
    const [loading, setLoading] = useState(false)

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSubmit = async () => {
        setError(null)

        if (!form.title)          return setError('El título es obligatorio')
        if (!form.type)           return setError('El tipo de evento es obligatorio')
        if (!form.event_date)     return setError('La fecha es obligatoria')
        if (!form.event_time)     return setError('La hora es obligatoria')
        if (!form.location)       return setError('La ubicación es obligatoria')
        if (!form.max_volunteers) return setError('El número de plazas es obligatorio')

        // Combinamos fecha y hora en un datetime
        const eventDateTime = `${form.event_date}T${form.event_time}:00`

        setLoading(true)
        try {
            await api.post('/events', {
                title:          form.title,
                description:    form.description,
                type:           form.type,
                event_date:     eventDateTime,
                location:       form.location,
                max_volunteers: parseInt(form.max_volunteers),
            }, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            navigate('/shelter/events')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el evento')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/shelter/events')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Crear evento</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Organiza un evento y convoca voluntarios
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-6">

                    {/* Información básica */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Información básica</SectionTitle>
                        <div className="flex flex-col gap-5">

                            <FormField label="Título" required>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Ej: Jornada de adopción de verano"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            {/* Tipo de evento */}
                            <FormField label="Tipo de evento" required>
                                <div className="grid grid-cols-2 gap-2">
                                    {typeOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => set('type', opt.value)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors text-left ${
                                                form.type === opt.value
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                            }`}
                                        >
                                            <span>{opt.icon}</span>
                                            <span className="font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Descripción">
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Describe el evento, qué se va a hacer, qué se necesita..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Fecha, hora y lugar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Fecha, hora y lugar</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <FormField label="Fecha" required>
                                <input
                                    type="date"
                                    value={form.event_date}
                                    onChange={e => set('event_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Hora" required>
                                <input
                                    type="time"
                                    value={form.event_time}
                                    onChange={e => set('event_time', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Ubicación" required>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={e => set('location', e.target.value)}
                                    placeholder="Ej: Parque del Retiro, Madrid"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Plazas disponibles" required>
                                <input
                                    type="number"
                                    value={form.max_volunteers}
                                    onChange={e => set('max_volunteers', e.target.value)}
                                    placeholder="Ej: 20"
                                    min="1"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 justify-end pb-8">
                        <button
                            onClick={() => navigate('/shelter/events')}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            {loading ? 'Creando evento...' : 'Crear evento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
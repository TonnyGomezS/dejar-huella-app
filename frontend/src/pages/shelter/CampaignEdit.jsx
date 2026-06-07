import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

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

export default function ShelterCampaignEdit() {
    const { shelterToken } = useShelter()
    const navigate         = useNavigate()
    const { id }           = useParams()

    const [form, setForm] = useState({
        title:       '',
        description: '',
        goal_amount: '',
        end_date:    '',
    })

    const [error, setError]       = useState(null)
    const [loading, setLoading]   = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const { data } = await api.get(`/campaigns/${id}`)
                setForm({
                    title:       data.title       || '',
                    description: data.description || '',
                    goal_amount: data.goal_amount  || '',
                    end_date:    data.end_date
                        ? data.end_date.split('T')[0]
                        : '',
                })
            } catch (e) {
                setError('No se pudo cargar la campaña')
            } finally {
                setFetching(false)
            }
        }
        fetchCampaign()
    }, [id])

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSubmit = async () => {
        setError(null)

        if (!form.title)       return setError('El título es obligatorio')
        if (!form.description) return setError('La descripción es obligatoria')
        if (!form.goal_amount) return setError('El objetivo económico es obligatorio')
        if (!form.end_date)    return setError('La fecha de fin es obligatoria')

        setLoading(true)
        try {
            await api.put(`/campaigns/${id}`, {
                title:       form.title,
                description: form.description,
                goal_amount: parseFloat(form.goal_amount),
                end_date:    form.end_date,
            }, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            navigate('/shelter/campaigns')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar la campaña')
        } finally {
            setLoading(false)
        }
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-4xl animate-bounce inline-block">💰</span>
                    <p className="text-gray-400 mt-2">Cargando campaña...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/shelter/campaigns')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Editar campaña</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Modifica los datos de {form.title}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-6">

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Información de la campaña</SectionTitle>
                        <div className="flex flex-col gap-5">

                            <FormField label="Título" required>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Descripción" required>
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
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
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </FormField>

                                <FormField label="Fecha de fin" required>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={e => set('end_date', e.target.value)}
                                        min={minDate}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Nota sobre animal vinculado */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="text-sm text-amber-700">
                            El animal vinculado no se puede cambiar una vez creada la campaña.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 justify-end pb-8">
                        <button
                            onClick={() => navigate('/shelter/campaigns')}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
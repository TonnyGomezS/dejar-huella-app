import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

const genderOptions = [
    { value: 'male',   label: 'Macho'  },
    { value: 'female', label: 'Hembra' },
]

const ageOptions = {
    dog: [
        { value: 'puppy',  label: 'Cachorro (menos de 1 año)' },
        { value: 'adult',  label: 'Adulto (1-7 años)'         },
        { value: 'senior', label: 'Senior (más de 7 años)'    },
    ],
    cat: [
        { value: 'kitten', label: 'Gatito (menos de 1 año)'  },
        { value: 'adult',  label: 'Adulto (1-10 años)'       },
        { value: 'senior', label: 'Senior (más de 10 años)'  },
    ],
}

const sizeOptions = [
    { value: 'small',  label: 'Pequeño (menos de 10kg)' },
    { value: 'medium', label: 'Mediano (10-25kg)'        },
    { value: 'large',  label: 'Grande (más de 25kg)'     },
]

const activityOptions = [
    { value: 'low',    label: 'Bajo · Paseos cortos y tranquilos'    },
    { value: 'medium', label: 'Medio · Paseos diarios moderados'     },
    { value: 'high',   label: 'Alto · Ejercicio intenso y frecuente' },
]

const hoursAloneOptions = [
    { value: 'less_than_4',     label: 'Menos de 4 horas'  },
    { value: 'between_4_and_8', label: 'Entre 4 y 8 horas' },
    { value: 'more_than_8',     label: 'Más de 8 horas'    },
]

const companionTypeOptions = [
    { value: 'independent',  label: 'Independiente · Prefiere su espacio'        },
    { value: 'balanced',     label: 'Equilibrado · Cariñoso pero no dependiente' },
    { value: 'affectionate', label: 'Muy cariñoso · Necesita mucha atención'     },
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

function Select({ value, onChange, options, placeholder }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {label}
            </span>
        </label>
    )
}

export default function ShelterAnimalEdit() {
    const { shelterToken } = useShelter()
    const navigate = useNavigate()
    const { id }   = useParams()

    const [form, setForm] = useState(null)
    const [preview, setPreview]   = useState(null)
    const [error, setError]       = useState(null)
    const [loading, setLoading]   = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                const { data } = await api.get(`/animals/${id}`)
                setForm({
                    name:                data.name                || '',
                    species:             data.species             || '',
                    gender:              data.gender              || '',
                    breed:               data.breed               || '',
                    age_range:           data.age_range           || '',
                    description:         data.description         || '',
                    image_url:           data.image_url           || '',
                    good_with_kids:      data.good_with_kids      ?? false,
                    good_with_cats:      data.good_with_cats      ?? false,
                    good_with_dogs:      data.good_with_dogs      ?? false,
                    good_with_strangers: data.good_with_strangers ?? false,
                    special_needs:       data.special_needs       ?? false,
                    size:                data.size                || '',
                    activity_level:      data.activity_level      || '',
                    max_hours_alone:     data.max_hours_alone     || '',
                    cat_companion_type:  data.cat_companion_type  || '',
                    indoor_only:         data.indoor_only         ?? false,
                })
                setPreview(data.image_url || null)
            } catch (e) {
                setError('No se pudo cargar el animal')
            } finally {
                setFetching(false)
            }
        }
        fetchAnimal()
    }, [id])

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    const handleImageUrl = (url) => {
        set('image_url', url)
        setPreview(url || null)
    }

    const handleSubmit = async () => {
        setError(null)
        if (!form.name)      return setError('El nombre es obligatorio')
        if (!form.gender)    return setError('El género es obligatorio')
        if (!form.age_range) return setError('El rango de edad es obligatorio')

        setLoading(true)
        try {
            await api.put(`/animals/${id}`, form, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            navigate('/shelter/animals')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar el animal')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-4xl animate-bounce inline-block">🐾</span>
                    <p className="text-gray-400 mt-2">Cargando datos del animal...</p>
                </div>
            </div>
        )
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No se encontró el animal</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/shelter/animals')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Editar animal</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Modifica los datos de {form.name}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <FormField label="Nombre" required>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => set('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            <FormField label="Raza">
                                <input
                                    type="text"
                                    value={form.breed}
                                    onChange={e => set('breed', e.target.value)}
                                    placeholder="Raza o mestizo"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </FormField>

                            {/* Especie: no editable */}
                            <FormField label="Especie">
                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500`}>
                                    <span>{form.species === 'dog' ? '🐕 Perro' : '🐈 Gato'}</span>
                                    <span className="ml-auto text-xs text-gray-400">No editable</span>
                                </div>
                            </FormField>

                            {/* Género */}
                            <FormField label="Género" required>
                                <div className="flex gap-3">
                                    {genderOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => set('gender', opt.value)}
                                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                                form.gender === opt.value
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            {/* Edad */}
                            <FormField label="Rango de edad" required>
                                <Select
                                    value={form.age_range}
                                    onChange={v => set('age_range', v)}
                                    options={ageOptions[form.species] || []}
                                    placeholder="Selecciona una edad"
                                />
                            </FormField>

                        </div>

                        <div className="mt-5">
                            <FormField label="Descripción">
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Foto */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Foto</SectionTitle>
                        <div className="flex gap-5 items-start">
                            <div className="w-32 h-32 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setPreview(null)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                                        {form.species === 'dog' ? '🐕' : '🐈'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <FormField label="URL de la imagen">
                                    <input
                                        type="url"
                                        value={form.image_url}
                                        onChange={e => handleImageUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/foto.jpg"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </FormField>
                                <p className="text-xs text-gray-400 mt-2">
                                    La preview se actualiza automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comportamiento social */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionTitle>Comportamiento social</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Toggle label="Compatible con niños"   checked={form.good_with_kids}      onChange={v => set('good_with_kids', v)}      />
                            <Toggle label="Compatible con gatos"   checked={form.good_with_cats}      onChange={v => set('good_with_cats', v)}      />
                            <Toggle label="Compatible con perros"  checked={form.good_with_dogs}      onChange={v => set('good_with_dogs', v)}      />
                            <Toggle label="Sociable con extraños"  checked={form.good_with_strangers} onChange={v => set('good_with_strangers', v)} />
                            <Toggle label="Necesidades especiales" checked={form.special_needs}       onChange={v => set('special_needs', v)}       />
                        </div>
                    </div>

                    {/* Campos específicos de perro */}
                    {form.species === 'dog' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Características del perro</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <FormField label="Tamaño">
                                    <Select value={form.size}            onChange={v => set('size', v)}            options={sizeOptions}        placeholder="Selecciona tamaño" />
                                </FormField>
                                <FormField label="Nivel de actividad">
                                    <Select value={form.activity_level}  onChange={v => set('activity_level', v)}  options={activityOptions}    placeholder="Selecciona nivel"  />
                                </FormField>
                                <FormField label="Máximo horas solo">
                                    <Select value={form.max_hours_alone} onChange={v => set('max_hours_alone', v)} options={hoursAloneOptions}  placeholder="Selecciona horas"  />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {/* Campos específicos de gato */}
                    {form.species === 'cat' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Características del gato</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <FormField label="Tipo de personalidad">
                                    <Select value={form.cat_companion_type} onChange={v => set('cat_companion_type', v)} options={companionTypeOptions} placeholder="Selecciona personalidad" />
                                </FormField>
                            </div>
                            <Toggle
                                label="Solo interior (no sale al exterior)"
                                checked={form.indoor_only}
                                onChange={v => set('indoor_only', v)}
                            />
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 justify-end pb-8">
                        <button
                            onClick={() => navigate('/shelter/animals')}
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
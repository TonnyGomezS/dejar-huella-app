import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'

// ─── Opciones de formulario ───────────────────────────────────────────────────

const dogOptions = {
    housing_type: [
        { value: 'apartment',          label: 'Piso sin jardín',       icon: '🏢' },
        { value: 'house_no_garden',    label: 'Casa sin jardín',       icon: '🏠' },
        { value: 'house_with_garden',  label: 'Casa con jardín',       icon: '🌳' },
    ],
    free_time: [
        { value: 'low',    label: 'Poco · Trabajo muchas horas',       icon: '⏰' },
        { value: 'medium', label: 'Moderado · Algunas horas al día',   icon: '🕐' },
        { value: 'high',   label: 'Mucho · Estoy en casa frecuentemente', icon: '🏡' },
    ],
    experience_level: [
        { value: 'none',        label: 'Ninguna · Sería mi primer perro',  icon: '🌱' },
        { value: 'some',        label: 'Algo · He tenido perros antes',    icon: '🐾' },
        { value: 'experienced', label: 'Experto · Tengo mucha experiencia', icon: '⭐' },
    ],
}

const catOptions = {
    hours_at_home: [
        { value: 'less_than_4',     label: 'Menos de 4 horas al día',  icon: '🏃' },
        { value: 'between_4_and_8', label: 'Entre 4 y 8 horas al día', icon: '🕐' },
        { value: 'more_than_8',     label: 'Más de 8 horas al día',    icon: '🏡' },
    ],
    companion_type: [
        { value: 'independent',  label: 'Independiente · Que se valga solo',        icon: '😸' },
        { value: 'balanced',     label: 'Equilibrado · Cariñoso pero no dependiente', icon: '🐱' },
        { value: 'affectionate', label: 'Muy cariñoso · Que necesite atención',     icon: '😻' },
    ],
    experience_level: [
        { value: 'none',        label: 'Ninguna · Sería mi primer gato',  icon: '🌱' },
        { value: 'some',        label: 'Algo · He tenido gatos antes',    icon: '🐾' },
        { value: 'experienced', label: 'Experto · Tengo mucha experiencia', icon: '⭐' },
    ],
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function SectionTitle({ children }) {
    return (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            {children}
        </h3>
    )
}

function OptionGroup({ label, options, value, onChange }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
            <div className="flex flex-col gap-2">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ' + (
                            value === opt.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-200 text-gray-700 hover:border-indigo-300 bg-white'
                        )}
                    >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {description && (
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                )}
            </div>
            <div
                onClick={() => onChange(!checked)}
                className={'relative w-11 h-6 rounded-full cursor-pointer transition-colors ' + (checked ? 'bg-indigo-600' : 'bg-gray-200')}
            >
                <div className={'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' + (checked ? 'translate-x-5' : 'translate-x-0')} />
            </div>
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Compatibility() {
    const navigate          = useNavigate()
    const [searchParams]    = useSearchParams()
    const initialSpecies    = searchParams.get('species') || 'dog'

    const [activeSpecies, setActiveSpecies] = useState(initialSpecies)
    const [dogForm, setDogForm] = useState({
        housing_type:          '',
        free_time:             '',
        experience_level:      '',
        has_young_children:    false,
        has_cats:              false,
        has_other_dogs:        false,
        accepts_special_needs: false,
    })
    const [catForm, setCatForm] = useState({
        hours_at_home:         '',
        companion_type:        '',
        has_outdoor_access:    false,
        can_secure_windows:    false,
        has_vertical_space:    false,
        experience_level:      '',
        accepts_special_needs: false,
        has_young_children:    false,
        has_other_cats:        false,
        has_dogs:              false,
    })

    const [dogHasProfile, setDogHasProfile] = useState(false)
    const [catHasProfile, setCatHasProfile] = useState(false)
    const [loading, setLoading]             = useState(true)
    const [saving, setSaving]               = useState(false)
    const [error, setError]                 = useState(null)
    const [success, setSuccess]             = useState(null)

    useEffect(() => {
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        setLoading(true)
        try {
            const [dogRes, catRes] = await Promise.all([
                api.get('/compatibility/dog').catch(e => {
                    if (e.response?.status === 404) return null
                    throw e
                }),
                api.get('/compatibility/cat').catch(e => {
                    if (e.response?.status === 404) return null
                    throw e
                }),
            ])

            if (dogRes) {
                const d = dogRes.data
                setDogHasProfile(true)
                setDogForm({
                    housing_type:          d.housing_type          || '',
                    free_time:             d.free_time             || '',
                    experience_level:      d.experience_level      || '',
                    has_young_children:    d.has_young_children    ?? false,
                    has_cats:              d.has_cats              ?? false,
                    has_other_dogs:        d.has_other_dogs        ?? false,
                    accepts_special_needs: d.accepts_special_needs ?? false,
                })
            }

            if (catRes) {
                const c = catRes.data
                setCatHasProfile(true)
                setCatForm({
                    hours_at_home:         c.hours_at_home         || '',
                    companion_type:        c.companion_type        || '',
                    has_outdoor_access:    c.has_outdoor_access    ?? false,
                    can_secure_windows:    c.can_secure_windows    ?? false,
                    has_vertical_space:    c.has_vertical_space    ?? false,
                    experience_level:      c.experience_level      || '',
                    accepts_special_needs: c.accepts_special_needs ?? false,
                    has_young_children:    c.has_young_children    ?? false,
                    has_other_cats:        c.has_other_cats        ?? false,
                    has_dogs:              c.has_dogs              ?? false,
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDog = async () => {
        setError(null)
        setSuccess(null)
        if (!dogForm.housing_type)     return setError('Indica el tipo de vivienda')
        if (!dogForm.free_time)        return setError('Indica tu tiempo libre')
        if (!dogForm.experience_level) return setError('Indica tu nivel de experiencia')

        setSaving(true)
        try {
            await api.post('/compatibility/dog', dogForm)
            setDogHasProfile(true)
            setSuccess('Perfil de perros guardado correctamente')
            setTimeout(() => {
                navigate('/animals?species=dog')
            }, 1500)
        } catch (e) {
            setError(e.response?.data?.message || 'Error al guardar el perfil')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveCat = async () => {
        setError(null)
        setSuccess(null)
        if (!catForm.hours_at_home)    return setError('Indica las horas que estás en casa')
        if (!catForm.companion_type)   return setError('Indica el tipo de gato que buscas')
        if (!catForm.experience_level) return setError('Indica tu nivel de experiencia')

        setSaving(true)
        try {
            await api.post('/compatibility/cat', catForm)
            setCatHasProfile(true)
            setSuccess('Perfil de gatos guardado correctamente')
            setTimeout(() => {
                navigate('/animals?species=cat')
            }, 1500)
        } catch (e) {
            setError(e.response?.data?.message || 'Error al guardar el perfil')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">🐾</span>
                    <p className="text-gray-400 mt-2">Cargando tu perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Mi perfil de compatibilidad</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cuéntanos sobre ti para que podamos encontrar los animales más compatibles contigo
                    </p>
                </div>

                {/* Selector de especie */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => {
                            setActiveSpecies('dog')
                            setError(null)
                            setSuccess(null)
                        }}
                        className={'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ' + (
                            activeSpecies === 'dog'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        )}
                    >
                        <span className="text-xl">🐕</span>
                        Perfil para perros
                        {dogHasProfile && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                ✓ Completado
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveSpecies('cat')
                            setError(null)
                            setSuccess(null)
                        }}
                        className={'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ' + (
                            activeSpecies === 'cat'
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                        )}
                    >
                        <span className="text-xl">🐈</span>
                        Perfil para gatos
                        {catHasProfile && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                ✓ Completado
                            </span>
                        )}
                    </button>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span>✅</span> {success}
                    </div>
                )}

                {/* ── FORMULARIO PERROS ── */}
                {activeSpecies === 'dog' && (
                    <div className="flex flex-col gap-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Tu vivienda y estilo de vida</SectionTitle>
                            <div className="flex flex-col gap-6">
                                <OptionGroup
                                    label="¿Dónde vives?"
                                    options={dogOptions.housing_type}
                                    value={dogForm.housing_type}
                                    onChange={v => setDogForm(prev => ({ ...prev, housing_type: v }))}
                                />
                                <OptionGroup
                                    label="¿Cuánto tiempo libre tienes para el perro?"
                                    options={dogOptions.free_time}
                                    value={dogForm.free_time}
                                    onChange={v => setDogForm(prev => ({ ...prev, free_time: v }))}
                                />
                                <OptionGroup
                                    label="¿Cuál es tu experiencia con perros?"
                                    options={dogOptions.experience_level}
                                    value={dogForm.experience_level}
                                    onChange={v => setDogForm(prev => ({ ...prev, experience_level: v }))}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Tu situación en casa</SectionTitle>
                            <div className="flex flex-col">
                                <Toggle
                                    label="Hay niños pequeños en casa"
                                    description="Menores de 6 años"
                                    checked={dogForm.has_young_children}
                                    onChange={v => setDogForm(prev => ({ ...prev, has_young_children: v }))}
                                />
                                <Toggle
                                    label="Tengo gatos en casa"
                                    checked={dogForm.has_cats}
                                    onChange={v => setDogForm(prev => ({ ...prev, has_cats: v }))}
                                />
                                <Toggle
                                    label="Tengo otros perros en casa"
                                    checked={dogForm.has_other_dogs}
                                    onChange={v => setDogForm(prev => ({ ...prev, has_other_dogs: v }))}
                                />
                                <Toggle
                                    label="Acepto perros con necesidades especiales"
                                    description="Enfermedades crónicas, discapacidades, medicación"
                                    checked={dogForm.accepts_special_needs}
                                    onChange={v => setDogForm(prev => ({ ...prev, accepts_special_needs: v }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pb-8">
                            <button
                                onClick={() => navigate('/animals?species=dog')}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveDog}
                                disabled={saving}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {saving ? 'Guardando...' : dogHasProfile ? 'Actualizar perfil' : 'Guardar perfil'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── FORMULARIO GATOS ── */}
                {activeSpecies === 'cat' && (
                    <div className="flex flex-col gap-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Tu estilo de vida</SectionTitle>
                            <div className="flex flex-col gap-6">
                                <OptionGroup
                                    label="¿Cuántas horas estás en casa al día?"
                                    options={catOptions.hours_at_home}
                                    value={catForm.hours_at_home}
                                    onChange={v => setCatForm(prev => ({ ...prev, hours_at_home: v }))}
                                />
                                <OptionGroup
                                    label="¿Qué tipo de gato buscas?"
                                    options={catOptions.companion_type}
                                    value={catForm.companion_type}
                                    onChange={v => setCatForm(prev => ({ ...prev, companion_type: v }))}
                                />
                                <OptionGroup
                                    label="¿Cuál es tu experiencia con gatos?"
                                    options={catOptions.experience_level}
                                    value={catForm.experience_level}
                                    onChange={v => setCatForm(prev => ({ ...prev, experience_level: v }))}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Tu vivienda</SectionTitle>
                            <div className="flex flex-col">
                                <Toggle
                                    label="Mi vivienda tiene acceso al exterior"
                                    description="Jardín, terraza, patio"
                                    checked={catForm.has_outdoor_access}
                                    onChange={v => setCatForm(prev => ({ ...prev, has_outdoor_access: v }))}
                                />
                                <Toggle
                                    label="Puedo asegurar ventanas y balcones"
                                    description="Redes de protección para gatos"
                                    checked={catForm.can_secure_windows}
                                    onChange={v => setCatForm(prev => ({ ...prev, can_secure_windows: v }))}
                                />
                                <Toggle
                                    label="Tengo espacios en altura"
                                    description="Estanterías, rascadores, zonas elevadas"
                                    checked={catForm.has_vertical_space}
                                    onChange={v => setCatForm(prev => ({ ...prev, has_vertical_space: v }))}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle>Tu situación en casa</SectionTitle>
                            <div className="flex flex-col">
                                <Toggle
                                    label="Hay niños pequeños en casa"
                                    description="Menores de 6 años"
                                    checked={catForm.has_young_children}
                                    onChange={v => setCatForm(prev => ({ ...prev, has_young_children: v }))}
                                />
                                <Toggle
                                    label="Tengo otros gatos en casa"
                                    checked={catForm.has_other_cats}
                                    onChange={v => setCatForm(prev => ({ ...prev, has_other_cats: v }))}
                                />
                                <Toggle
                                    label="Tengo perros en casa"
                                    checked={catForm.has_dogs}
                                    onChange={v => setCatForm(prev => ({ ...prev, has_dogs: v }))}
                                />
                                <Toggle
                                    label="Acepto gatos con necesidades especiales"
                                    description="Enfermedades crónicas, discapacidades, medicación"
                                    checked={catForm.accepts_special_needs}
                                    onChange={v => setCatForm(prev => ({ ...prev, accepts_special_needs: v }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pb-8">
                            <button
                                onClick={() => navigate('/animals?species=cat')}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveCat}
                                disabled={saving}
                                className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {saving ? 'Guardando...' : catHasProfile ? 'Actualizar perfil' : 'Guardar perfil'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
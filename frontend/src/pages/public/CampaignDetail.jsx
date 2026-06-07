import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

function daysLeft(endDate) {
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    })
}

export default function CampaignDetail() {
    const { id }    = useParams()
    const navigate  = useNavigate()
    const { token } = useAuth()

    const [campaign, setCampaign]         = useState(null)
    const [updates, setUpdates]           = useState([])
    const [loading, setLoading]           = useState(true)
    const [showDonateModal, setShowDonateModal] = useState(false)
    const [donateForm, setDonateForm]     = useState({
        amount:      '',
        card_number: '',
        expiry:      '',
        cvv:         '',
    })
    const [donating, setDonating]   = useState(false)
    const [donateResult, setDonateResult] = useState(null)
    const [error, setError]         = useState(null)

    useEffect(() => {
        fetchCampaign()
    }, [id])

    const fetchCampaign = async () => {
        setLoading(true)
        try {
            const [campaignRes, updatesRes] = await Promise.all([
                api.get('/campaigns/' + id),
                api.get('/campaigns/' + id + '/updates'),
            ])
            setCampaign(campaignRes.data)
            setUpdates(updatesRes.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDonate = async () => {
        setError(null)

        if (!donateForm.amount || parseFloat(donateForm.amount) < 1)
            return setError('El importe mínimo es 1€')
        if (!donateForm.card_number || donateForm.card_number.replace(/\s/g, '').length !== 16)
            return setError('Introduce un número de tarjeta válido de 16 dígitos')
        if (!donateForm.expiry)
            return setError('Introduce la fecha de caducidad')
        if (!donateForm.cvv || donateForm.cvv.length !== 3)
            return setError('El CVV debe tener 3 dígitos')

        setDonating(true)
        try {
            const { data } = await api.post('/campaigns/' + id + '/donate', {
                amount:      parseFloat(donateForm.amount),
                card_number: donateForm.card_number.replace(/\s/g, ''),
                expiry:      donateForm.expiry,
                cvv:         donateForm.cvv,
            })

            setDonateResult(data)
            setShowDonateModal(false)

            // Actualizamos el progreso en la campaña
            setCampaign(prev => ({
                ...prev,
                raised_amount:    data.raised_amount,
                progress_percent: data.progress_percent,
            }))

            setDonateForm({ amount: '', card_number: '', expiry: '', cvv: '' })
        } catch (e) {
            setError(e.response?.data?.message || 'Error al procesar el pago')
        } finally {
            setDonating(false)
        }
    }

    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16)
        return digits.replace(/(.{4})/g, '$1 ').trim()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl animate-bounce inline-block">💰</span>
                    <p className="text-gray-400 mt-2">Cargando campaña...</p>
                </div>
            </div>
        )
    }

    if (!campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-5xl">🔍</span>
                    <p className="text-gray-500 mt-3">Campaña no encontrada</p>
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

    const progress  = campaign.progress_percent || 0
    const days      = daysLeft(campaign.end_date)
    const isActive  = campaign.status === 'active'

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera con imagen */}
            <div className="relative h-64 bg-gray-200">
                {campaign.animal?.image_url ? (
                    <img
                        src={campaign.animal.image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-200">
                        <span className="text-8xl opacity-30">💛</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-4xl mx-auto flex items-end justify-between">
                        <div>
                            <span className={'text-xs font-medium px-2.5 py-1 rounded-full mb-2 inline-block ' + (
                                isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            )}>
                                {isActive ? 'Activa' : 'Cerrada'}
                            </span>
                            <h1 className="text-3xl font-bold text-white">
                                {campaign.title}
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white/70 hover:text-white text-sm transition-colors"
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

                        {/* Resultado donación */}
                        {donateResult && (
                            <div className={'rounded-2xl p-5 border ' + (
                                donateResult.donation?.payment_status === 'completed' || donateResult.donation?.payment_status?.value === 'completed'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                            )}>
                                <p className={'font-bold text-lg mb-1 ' + (
                                    donateResult.donation?.payment_status === 'completed' || donateResult.donation?.payment_status?.value === 'completed'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                )}>
                                    {donateResult.message}
                                </p>
                                {donateResult.raised_amount !== undefined && (
                                    <p className="text-sm text-green-600">
                                        Total recaudado: {donateResult.raised_amount}€
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Descripción */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                Sobre esta campaña
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {campaign.description}
                            </p>

                            {campaign.animal && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-2">Animal vinculado</p>
                                    <Link
                                        to={'/animals/' + campaign.animal.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                            {campaign.animal.image_url ? (
                                                <img
                                                    src={campaign.animal.image_url}
                                                    alt={campaign.animal.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    {campaign.animal.species === 'dog' ? '🐕' : '🐈'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{campaign.animal.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {campaign.animal.breed || (campaign.animal.species === 'dog' ? 'Perro' : 'Gato')}
                                            </p>
                                        </div>
                                        <span className="ml-auto text-indigo-600 text-sm">→</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Actualizaciones */}
                        {updates.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-5">
                                    Actualizaciones
                                </h2>
                                <div className="flex flex-col gap-5">
                                    {updates.map(update => (
                                        <div key={update.id} className="border-l-4 border-violet-300 pl-4">
                                            <p className="font-semibold text-gray-800 mb-1">
                                                {update.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mb-2">
                                                {formatDate(update.created_at)}
                                            </p>
                                            {update.image_url && (
                                                <img
                                                    src={update.image_url}
                                                    alt={update.title}
                                                    className="w-full rounded-xl mb-3 object-cover max-h-48"
                                                />
                                            )}
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {update.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="flex flex-col gap-5">

                        {/* Progreso */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className="text-center mb-4">
                                <p className="text-4xl font-bold text-gray-800">
                                    {campaign.raised_amount || 0}€
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    recaudados de {campaign.goal_amount}€
                                </p>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                                <div
                                    className="bg-violet-500 h-3 rounded-full transition-all"
                                    style={{ width: Math.min(progress, 100) + '%' }}
                                />
                            </div>

                            <div className="flex justify-between text-sm text-gray-500 mb-4">
                                <span className="font-medium text-violet-600">{progress}%</span>
                                {isActive && (
                                    <span className={days <= 5 ? 'text-red-500 font-medium' : ''}>
                                        {days === 0 ? '¡Último día!' : days + ' días restantes'}
                                    </span>
                                )}
                            </div>

                            {isActive && !token && (
                                <Link
                                    to="/login"
                                    className="block text-center text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    Iniciar sesión para donar
                                </Link>
                            )}

                            {isActive && token && (
                                <button
                                    onClick={() => setShowDonateModal(true)}
                                    className="w-full text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    💛 Colaborar ahora
                                </button>
                            )}

                            {!isActive && (
                                <div className="text-center py-2">
                                    <p className="text-sm text-gray-500">
                                        Esta campaña ya está cerrada
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Protectora */}
                        {campaign.shelter && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Organizada por
                                </h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                                        🏠
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {campaign.shelter.name}
                                        </p>
                                        {campaign.shelter.location && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                📍 {campaign.shelter.location.municipality}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={'/shelters/' + campaign.shelter.id}
                                    className="block text-center text-sm border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium py-2 rounded-xl transition-colors"
                                >
                                    Ver protectora
                                </Link>
                            </div>
                        )}

                        {/* Fechas */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                Fechas
                            </h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Inicio</span>
                                    <span className="font-medium text-gray-700">
                                        {formatDate(campaign.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fin</span>
                                    <span className="font-medium text-gray-700">
                                        {formatDate(campaign.end_date)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal donación */}
            {showDonateModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            Realizar donación
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {campaign.title}
                        </p>

                        <div className="flex flex-col gap-4">

                            {/* Importe */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Importe (€) <span className="text-red-400">*</span>
                                </label>
                                <div className="flex gap-2 mb-2">
                                    {[5, 10, 20, 50].map(amount => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setDonateForm(prev => ({ ...prev, amount: amount.toString() }))}
                                            className={'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ' + (
                                                donateForm.amount === amount.toString()
                                                    ? 'bg-violet-600 text-white border-violet-600'
                                                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                                            )}
                                        >
                                            {amount}€
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={donateForm.amount}
                                    onChange={e => setDonateForm(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Otro importe..."
                                    min="1"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            {/* Número de tarjeta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Número de tarjeta <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={donateForm.card_number}
                                    onChange={e => setDonateForm(prev => ({ ...prev, card_number: formatCardNumber(e.target.value) }))}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                                />
                            </div>

                            {/* Caducidad y CVV */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Caducidad <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={donateForm.expiry}
                                        onChange={e => setDonateForm(prev => ({ ...prev, expiry: e.target.value }))}
                                        placeholder="MM/AA"
                                        maxLength={5}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        CVV <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={donateForm.cvv}
                                        onChange={e => setDonateForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                                        placeholder="123"
                                        maxLength={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Nota tarjeta de prueba */}
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
                                <p className="font-medium text-gray-600 mb-1">Tarjetas de prueba</p>
                                <p>✅ Pago exitoso: <span className="font-mono">4242 4242 4242 4242</span></p>
                                <p>❌ Pago fallido: <span className="font-mono">4242 4242 4242 0000</span></p>
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
                                    setShowDonateModal(false)
                                    setError(null)
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDonate}
                                disabled={donating}
                                className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {donating ? 'Procesando...' : 'Donar ' + (donateForm.amount ? donateForm.amount + '€' : '')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const typeConfig = {
    adoption_day:      { label: 'Jornada de adopción',    color: 'bg-indigo-100 text-indigo-700',  icon: '🐾' },
    solidarity_market: { label: 'Mercadillo solidario',   color: 'bg-emerald-100 text-emerald-700', icon: '🛍️' },
    open_day:          { label: 'Puertas abiertas',        color: 'bg-amber-100 text-amber-700',    icon: '🏠' },
    volunteering:      { label: 'Voluntariado',            color: 'bg-rose-100 text-rose-700',      icon: '🙋' },
    collective_walk:   { label: 'Paseo colectivo',         color: 'bg-sky-100 text-sky-700',        icon: '🦮' },
    fundraising:       { label: 'Recaudación de fondos',   color: 'bg-violet-100 text-violet-700',  icon: '💰' },
    awareness_talk:    { label: 'Charla de concienciación', color: 'bg-orange-100 text-orange-700', icon: '🎤' },
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return {
        day:     date.getDate(),
        month:   date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        weekday: date.toLocaleString('es-ES', { weekday: 'long' }),
        time:    date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        full:    date,
    }
}

function isThisWeek(date) {
    const now  = new Date()
    const week = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
    return date >= now && date <= week
}

function isThisMonth(date) {
    const now = new Date()
    return date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear()
}

export default function EventList() {
    const { token } = useAuth()

    const [events, setEvents]         = useState([])
    const [loading, setLoading]       = useState(true)
    const [activeFilter, setActiveFilter] = useState('all')
    const [activeType, setActiveType] = useState('')
    const [registering, setRegistering] = useState(null)
    const [registered, setRegistered] = useState({})

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/events')
            setEvents(data.data?.data || data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (eventId) => {
        if (!token) return
        setRegistering(eventId)
        try {
            await api.post(`/events/${eventId}/register`)
            setRegistered(prev => ({ ...prev, [eventId]: true }))
        } catch (e) {
            console.error(e)
        } finally {
            setRegistering(null)
        }
    }

    // Filtrado
    const filteredEvents = events.filter(event => {
        const date = new Date(event.event_date)

        if (activeFilter === 'week'  && !isThisWeek(date))  return false
        if (activeFilter === 'month' && !isThisMonth(date)) return false
        if (activeType && event.type !== activeType)         return false
        return true
    })

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-sky-600 to-cyan-400 text-white py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        📅 Eventos de voluntariado
                    </h1>
                    <p className="text-white/80">
                        Participa en eventos organizados por protectoras cerca de ti
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Filtros de fecha */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {[
                        { value: 'all',   label: 'Todos los eventos' },
                        { value: 'week',  label: 'Esta semana'       },
                        { value: 'month', label: 'Este mes'          },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setActiveFilter(f.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                activeFilter === f.value
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Filtros por tipo */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveType('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                            activeType === ''
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        Todos los tipos
                    </button>
                    {Object.entries(typeConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setActiveType(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                activeType === key
                                    ? `${config.color} border-current`
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {config.icon} {config.label}
                        </button>
                    ))}
                </div>

                {/* Lista de eventos */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">📅</span>
                        <p className="text-gray-400 mt-2">Cargando eventos...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">📭</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No hay eventos con estos filtros
                        </p>
                        <button
                            onClick={() => { setActiveFilter('all'); setActiveType('') }}
                            className="mt-4 text-sm text-sky-600 hover:underline"
                        >
                            Ver todos los eventos
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredEvents.map(event => {
                            const date     = formatDate(event.event_date)
                            const type     = typeConfig[event.type] || { label: event.type, color: 'bg-gray-100 text-gray-600', icon: '📅' }
                            const spotsLeft = event.available_spots ?? (event.max_volunteers - (event.confirmed_count || 0))
                            const isFull   = spotsLeft <= 0
                            const isReg    = registered[event.id]

                            return (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-5 hover:shadow-md transition-shadow"
                                >
                                    {/* Fecha */}
                                    <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-sky-50 rounded-xl py-3">
                                        <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">
                                            {date.month}
                                        </span>
                                        <span className="text-3xl font-bold text-sky-700 leading-none mt-1">
                                            {date.day}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                                {event.title}
                                            </h3>
                                            <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${type.color}`}>
                                                {type.icon} {type.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                            <span>🕐 {date.time}h</span>
                                            <span>📍 {event.location}</span>
                                            <span>🏠 {event.shelter?.name}</span>
                                        </div>

                                        {event.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                                                {isFull
                                                    ? '🔴 Plazas agotadas'
                                                    : `🟢 ${spotsLeft} plazas disponibles`
                                                }
                                            </span>

                                            {token ? (
                                                <button
                                                    onClick={() => handleRegister(event.id)}
                                                    disabled={isFull || isReg || registering === event.id}
                                                    className={`text-sm font-medium px-5 py-2 rounded-xl transition-colors ${
                                                        isReg
                                                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                            : isFull
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                                                    }`}
                                                >
                                                    {isReg
                                                        ? '✅ Apuntado'
                                                        : registering === event.id
                                                        ? 'Procesando...'
                                                        : 'Apuntarme'
                                                    }
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/login"
                                                    className="text-sm font-medium px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                                                >
                                                    Apuntarme
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
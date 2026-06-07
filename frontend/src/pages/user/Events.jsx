import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const typeConfig = {
    adoption_day:      { label: 'Jornada de adopción',     color: 'bg-indigo-100 text-indigo-700',   icon: '🐾' },
    solidarity_market: { label: 'Mercadillo solidario',    color: 'bg-emerald-100 text-emerald-700', icon: '🛍️' },
    open_day:          { label: 'Puertas abiertas',        color: 'bg-amber-100 text-amber-700',     icon: '🏠' },
    volunteering:      { label: 'Voluntariado',            color: 'bg-rose-100 text-rose-700',       icon: '🙋' },
    collective_walk:   { label: 'Paseo colectivo',         color: 'bg-sky-100 text-sky-700',         icon: '🦮' },
    fundraising:       { label: 'Recaudación de fondos',   color: 'bg-violet-100 text-violet-700',   icon: '💰' },
    awareness_talk:    { label: 'Charla de concienciación', color: 'bg-orange-100 text-orange-700',  icon: '🎤' },
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return {
        day:     date.getDate(),
        month:   date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        weekday: date.toLocaleString('es-ES', { weekday: 'long' }),
        time:    date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isPast:  date < new Date(),
        full:    date,
    }
}

export default function UserEvents() {
    const [registrations, setRegistrations] = useState([])
    const [loading, setLoading]             = useState(true)
    const [filterPast, setFilterPast]       = useState(false)
    const [cancelling, setCancelling]       = useState(null)

    useEffect(() => {
        fetchRegistrations()
    }, [])

    const fetchRegistrations = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/dashboard/events/list')
            setRegistrations(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (eventId) => {
        if (!confirm('¿Seguro que quieres cancelar tu inscripción?')) return
        setCancelling(eventId)
        try {
            await api.delete('/events/' + eventId + '/register')
            setRegistrations(prev => prev.filter(r => r.event?.id !== eventId))
        } catch (e) {
            console.error(e)
        } finally {
            setCancelling(null)
        }
    }

    const now = new Date()
    const filtered = registrations.filter(reg => {
        const isPast = new Date(reg.event?.event_date) < now
        return filterPast ? isPast : !isPast
    })

    const upcomingCount = registrations.filter(r => new Date(r.event?.event_date) >= now).length
    const pastCount     = registrations.filter(r => new Date(r.event?.event_date) < now).length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Mis eventos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {upcomingCount} próximo{upcomingCount !== 1 ? 's' : ''} · {pastCount} pasado{pastCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterPast(false)}
                        className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                            !filterPast
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        )}
                    >
                        Próximos ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilterPast(true)}
                        className={'px-4 py-2 rounded-full text-sm font-medium transition-colors border ' + (
                            filterPast
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        )}
                    >
                        Pasados ({pastCount})
                    </button>
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="text-4xl animate-bounce inline-block">📅</span>
                        <p className="text-gray-400 mt-2">Cargando eventos...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">📅</span>
                        <p className="text-gray-500 mt-3 font-medium">
                            No tienes eventos {filterPast ? 'pasados' : 'próximos'}
                        </p>
                        {!filterPast && (
                            <Link
                                to="/events"
                                className="mt-4 inline-block text-sm text-indigo-600 font-medium hover:underline"
                            >
                                Ver eventos disponibles
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(reg => {
                            const event  = reg.event
                            if (!event) return null
                            const date   = formatDate(event.event_date)
                            const type   = typeConfig[event.type] || { label: event.type, color: 'bg-gray-100 text-gray-600', icon: '📅' }

                            return (
                                <div
                                    key={reg.id}
                                    className={'bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ' + (date.isPast ? 'opacity-70' : '')}
                                >
                                    <div className="flex gap-4">

                                        {/* Fecha */}
                                        <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-indigo-50 rounded-xl py-3">
                                            <span className="text-xs font-bold text-indigo-500 uppercase">
                                                {date.month}
                                            </span>
                                            <span className="text-3xl font-bold text-indigo-700 leading-none mt-1">
                                                {date.day}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                                    {event.title}
                                                </h3>
                                                <span className={'flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ' + type.color}>
                                                    {type.icon} {type.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                                <span>🕐 {date.time}h</span>
                                                <span>📍 {event.location}</span>
                                                <span>🏠 {event.shelter?.name}</span>
                                            </div>

                                            {/* Estado inscripción */}
                                            <div className="flex items-center justify-between">
                                                <span className={'text-xs font-medium px-2.5 py-1 rounded-full ' + (
                                                    reg.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                )}>
                                                    {reg.status === 'confirmed' ? '✅ Inscrito' : '❌ Cancelado'}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {!date.isPast && reg.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleCancel(event.id)}
                                                            disabled={cancelling === event.id}
                                                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            {cancelling === event.id ? '...' : 'Cancelar inscripción'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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
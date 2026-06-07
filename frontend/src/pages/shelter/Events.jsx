import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
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
        day:   date.getDate(),
        month: date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        time:  date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    }
}

export default function ShelterEvents() {
    const { shelter, shelterToken } = useShelter()

    const [events, setEvents]               = useState([])
    const [loading, setLoading]             = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [registrations, setRegistrations] = useState([])
    const [loadingRegs, setLoadingRegs]     = useState(false)
    const [deleting, setDeleting]           = useState(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(`/events?shelter_id=${shelter.id}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setEvents(data.data?.data || data.data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchRegistrations = async (eventId) => {
        setLoadingRegs(true)
        try {
            const { data } = await api.get(`/shelter/events/${eventId}/registrations`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setRegistrations(data.registrations || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingRegs(false)
        }
    }

    const handleViewRegistrations = (event) => {
        setSelectedEvent(event)
        fetchRegistrations(event.id)
    }

    const handleDelete = async (eventId) => {
        if (!confirm('¿Seguro que quieres eliminar este evento?')) return
        setDeleting(eventId)
        try {
            await api.delete(`/events/${eventId}`, {
                headers: { Authorization: `Bearer ${shelterToken}` }
            })
            setEvents(prev => prev.filter(e => e.id !== eventId))
            if (selectedEvent?.id === eventId) setSelectedEvent(null)
        } catch (e) {
            console.error(e)
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mis eventos</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {events.length} evento{events.length !== 1 ? 's' : ''} próximo{events.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        to="/shelter/events/create"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                    >
                        <span>+</span> Crear evento
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Lista de eventos */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="text-center py-20">
                                <span className="text-4xl animate-bounce inline-block">📅</span>
                                <p className="text-gray-400 mt-2">Cargando eventos...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-5xl">📅</span>
                                <p className="text-gray-500 mt-3 font-medium">
                                    No tienes eventos próximos
                                </p>
                                <Link
                                    to="/shelter/events/create"
                                    className="mt-4 inline-block text-sm text-amber-600 font-medium hover:underline"
                                >
                                    Crear primer evento
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {events.map(event => {
                                    const date       = formatDate(event.event_date)
                                    const type       = typeConfig[event.type] || { label: event.type, color: 'bg-gray-100 text-gray-600', icon: '📅' }
                                    const spots      = event.available_spots ?? event.max_volunteers
                                    const isSelected = selectedEvent?.id === event.id

                                    return (
                                        <div
                                            key={event.id}
                                            className={`bg-white rounded-2xl shadow-sm border transition-all ${
                                                isSelected ? 'border-amber-300 shadow-md' : 'border-gray-100'
                                            }`}
                                        >
                                            <div className="flex gap-4 p-4">
                                                {/* Fecha */}
                                                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center bg-amber-50 rounded-xl py-2">
                                                    <span className="text-xs font-bold text-amber-500 uppercase">
                                                        {date.month}
                                                    </span>
                                                    <span className="text-2xl font-bold text-amber-700 leading-none mt-0.5">
                                                        {date.day}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-bold text-gray-800 leading-tight">
                                                            {event.title}
                                                        </h3>
                                                        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${type.color}`}>
                                                            {type.icon} {type.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                                                        <span>🕐 {date.time}h</span>
                                                        <span>📍 {event.location}</span>
                                                        <span className={spots > 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                            {spots > 0 ? `${spots} plazas libres` : 'Completo'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-2 px-4 pb-4">
                                                <button
                                                    onClick={() => handleViewRegistrations(event)}
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                                        isSelected
                                                            ? 'bg-amber-500 text-white'
                                                            : 'border border-amber-300 text-amber-600 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    Ver inscritos
                                                </button>
                                                <Link
                                                    to={`/shelter/events/${event.id}/edit`}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    disabled={deleting === event.id}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    {deleting === event.id ? '...' : 'Eliminar'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Panel de inscritos */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit sticky top-24">
                        {!selectedEvent ? (
                            <div className="text-center py-8">
                                <span className="text-3xl">👥</span>
                                <p className="text-gray-400 mt-2 text-sm">
                                    Selecciona un evento para ver los inscritos
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                                        {selectedEvent.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {registrations.length} inscrito{registrations.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {loadingRegs ? (
                                    <div className="text-center py-6">
                                        <span className="text-2xl animate-bounce inline-block">👥</span>
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="text-center py-6">
                                        <span className="text-3xl">🕐</span>
                                        <p className="text-gray-400 mt-2 text-sm">
                                            Aún no hay inscritos
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {registrations.map(reg => (
                                            <div
                                                key={reg.id}
                                                className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0">
                                                    👤
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {reg.user?.name || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {reg.user?.email || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
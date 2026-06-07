import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useShelter } from '../../context/ShelterContext'
import UserSidebar from './UserSidebar'
import ShelterSidebar from './ShelterSidebar'

function Dropdown({ label, items }) {
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const handler = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors py-2">
                {label}
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 flex flex-row gap-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 min-w-max">
                    {items.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function Navbar() {
    const { user, token }                             = useAuth()
    const { shelter, shelterToken }                   = useShelter()
    const [userSidebarOpen, setUserSidebarOpen]       = useState(false)
    const [shelterSidebarOpen, setShelterSidebarOpen] = useState(false)

    return (
        <>
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link
                            to={token || shelterToken ? (shelterToken ? '/shelter/dashboard' : '/dashboard') : '/'}
                            className="flex items-center gap-2"
                        >
                            <span className="text-2xl">🐾</span>
                            <span className="font-bold text-indigo-600 text-lg hidden sm:block">
                                Deja tu Huella
                            </span>
                        </Link>

                        {/* Navegación central */}
                        <div className="hidden md:flex items-center gap-1">

                            {/* Protectora logueada → enlaces de gestión */}
                            {shelterToken && shelter && (
                                <>
                                    <Link
                                        to="/shelter/animals"
                                        className="text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors px-3 py-2"
                                    >
                                        Mis animales
                                    </Link>
                                    <Link
                                        to="/shelter/requests"
                                        className="text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors px-3 py-2"
                                    >
                                        Solicitudes pendientes
                                    </Link>
                                    <Link
                                        to="/shelter/events"
                                        className="text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors px-3 py-2"
                                    >
                                        Mis eventos
                                    </Link>
                                    <Link
                                        to="/shelter/campaigns"
                                        className="text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors px-3 py-2"
                                    >
                                        Mis campañas
                                    </Link>
                                </>
                            )}

                            {/* Usuario logueado o sin sesión → enlaces públicos */}
                            {!shelterToken && (
                                <>
                                    <Dropdown
                                        label="Explorar"
                                        items={[
                                            { to: '/animals?species=dog', icon: '🐕', label: 'Perros'      },
                                            { to: '/animals?species=cat', icon: '🐈', label: 'Gatos'       },
                                            { to: '/shelters',            icon: '🏠', label: 'Protectoras' },
                                        ]}
                                    />
                                    <Dropdown
                                        label="Comunidad"
                                        items={[
                                            { to: '/events',    icon: '📅', label: 'Eventos'   },
                                            { to: '/campaigns', icon: '💰', label: 'Campañas'  },
                                        ]}
                                    />
                                    <Link
                                        to="/como-funciona"
                                        className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors px-3 py-2"
                                    >
                                        Cómo funciona
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-3">

                            {/* Usuario autenticado */}
                            {token && user && (
                                <button
                                    onClick={() => setUserSidebarOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors border-2 border-indigo-200 hover:border-indigo-400"
                                >
                                    <span className="text-lg">👤</span>
                                </button>
                            )}

                            {/* Protectora autenticada */}
                            {shelterToken && shelter && (
                                <button
                                    onClick={() => setShelterSidebarOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-colors"
                                >
                                    {shelter.image_url ? (
                                        <img
                                            src={shelter.image_url}
                                            alt={shelter.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg bg-amber-100 w-full h-full flex items-center justify-center">
                                            🐾
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Sin sesión */}
                            {!token && !shelterToken && (
                                <>
                                    <Link to="/login"
                                        className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                        Iniciar sesión
                                    </Link>
                                    <Link to="/register"
                                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                                        Registrarse
                                    </Link>
                                    <Link to="/shelters/login"
                                        className="text-sm border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                                        Soy protectora
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <UserSidebar
                isOpen={userSidebarOpen}
                onClose={() => setUserSidebarOpen(false)}
            />
            <ShelterSidebar
                isOpen={shelterSidebarOpen}
                onClose={() => setShelterSidebarOpen(false)}
            />
        </>
    )
}
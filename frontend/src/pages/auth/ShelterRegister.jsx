import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShelter } from '../../context/ShelterContext'
import api from '../../api/axios'

export default function ShelterRegister() {
    const { loginShelter } = useShelter()
    const navigate         = useNavigate()

    const [form, setForm] = useState({
        name: '', email: '', password: '', password_confirmation: '',
        description: '', address: '', phone: '',
        autonomous_community: '', province: '', municipality: ''
    })
    const [error, setError]     = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { data } = await api.post('/shelters/auth/register', form)
            loginShelter(data.shelter, data.token)
            navigate('/shelter/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">

            {/* Panel izquierdo */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-rose-600">
                <img
                    src="https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&auto=format&fit=crop"
                    alt="Voluntarios con animales"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <span className="text-6xl mb-6">🌟</span>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Da visibilidad
                        a tu protectora
                    </h1>
                    <p className="text-lg text-rose-100 leading-relaxed">
                        Llega a más personas, gestiona
                        tus animales y campañas, y
                        encuentra voluntarios comprometidos.
                    </p>
                </div>
            </div>

            {/* Panel derecho */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md">

                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <span className="text-3xl">🐾</span>
                        <span className="text-xl font-bold text-indigo-600">
                            Deja tu Huella
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Registra tu protectora
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Únete a la red de protectoras de España
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Datos de acceso
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la protectora
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Protectora Ejemplo"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="protectora@correo.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Repite"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                            Información de contacto
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Calle, número, ciudad"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="600 000 000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Cuéntanos sobre tu protectora..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white resize-none"
                            />
                        </div>

                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                            Ubicación
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comunidad Autónoma
                            </label>
                            <input
                                type="text"
                                name="autonomous_community"
                                value={form.autonomous_community}
                                onChange={handleChange}
                                placeholder="Comunidad de Madrid"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincia
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={form.province}
                                    onChange={handleChange}
                                    placeholder="Madrid"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Municipio
                                </label>
                                <input
                                    type="text"
                                    name="municipality"
                                    value={form.municipality}
                                    onChange={handleChange}
                                    placeholder="Madrid"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
                        >
                            {loading ? 'Registrando protectora...' : 'Registrar protectora'}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-center text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/shelters/login"
                            className="text-rose-600 font-medium hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
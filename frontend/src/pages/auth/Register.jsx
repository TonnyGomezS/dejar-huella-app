import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Register() {
    const { login } = useAuth()
    const navigate  = useNavigate()

    const [form, setForm] = useState({
        name: '', email: '', password: '', password_confirmation: '', phone: ''
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
            const { data } = await api.post('/auth/register', form)
            login(data.user, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">

            {/* Panel izquierdo */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-600">
                <img
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&auto=format&fit=crop"
                    alt="Gato y perro juntos"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <span className="text-6xl mb-6">❤️</span>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Únete a nuestra comunidad
                    </h1>
                    <p className="text-lg text-emerald-100 leading-relaxed">
                        Más de mil animales esperan encontrar
                        a alguien como tú. Crear una cuenta
                        es el primer paso para cambiar una vida.
                    </p>
                </div>
            </div>

            {/* Panel derecho */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-md">

                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <span className="text-3xl">🐾</span>
                        <span className="text-xl font-bold text-indigo-600">
                            Deja tu Huella
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Crea tu cuenta
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Empieza a marcar la diferencia hoy
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
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
                                placeholder="tu@correo.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                            Ubicación
                            <span className="text-gray-400 font-normal ml-1">(opcional)</span>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-center text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login"
                            className="text-emerald-600 font-medium hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Login() {
    const { login } = useAuth()
    const navigate  = useNavigate()

    const [form, setForm]       = useState({ email: '', password: '' })
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
            const { data } = await api.post('/auth/login', form)
            login(data.user, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">

            {/* Panel izquierdo: imagen + mensaje */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600">
                <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop"
                    alt="Perros felices"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <span className="text-6xl mb-6">🐾</span>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Cada huella cuenta
                    </h1>
                    <p className="text-lg text-indigo-100 leading-relaxed">
                        Miles de animales esperan una oportunidad.
                        Tú puedes marcar la diferencia adoptando,
                        apadrinando o simplemente colaborando.
                    </p>
                </div>
            </div>

            {/* Panel derecho: formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-md">

                    {/* Logo móvil */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <span className="text-3xl">🐾</span>
                        <span className="text-xl font-bold text-indigo-600">
                            Deja tu Huella
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Bienvenido de vuelta
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Inicia sesión para continuar ayudando
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
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
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col gap-3 text-sm text-center">
                        <p className="text-gray-500">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register"
                                className="text-indigo-600 font-medium hover:underline">
                                Regístrate gratis
                            </Link>
                        </p>
                        <p className="text-gray-500">
                            ¿Eres una protectora?{' '}
                            <Link to="/shelters/login"
                                className="text-indigo-600 font-medium hover:underline">
                                Accede aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
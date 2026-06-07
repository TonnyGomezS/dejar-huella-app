import { useState } from 'react'
import { Link } from 'react-router-dom'

const sections = [
    {
        icon:  '🐾',
        title: 'Adopción y acogida',
        color: 'bg-indigo-50 border-indigo-200',
        headerColor: 'text-indigo-700',
        faqs: [
            {
                q: '¿Cómo puedo adoptar un animal?',
                a: 'Regístrate, busca un animal en el catálogo y entra en su ficha. Desde allí puedes enviar una solicitud de adopción, acogida o apadrinamiento con un mensaje opcional para la protectora.',
            },
            {
                q: '¿Qué diferencia hay entre adoptar, acoger y apadrinar?',
                a: 'La adopción es permanente. La acogida es temporal, el animal vive contigo mientras encuentra familia definitiva. El apadrinamiento es una contribución económica para cubrir sus gastos sin llevártelo a casa.',
            },
            {
                q: '¿Qué pasa después de enviar una solicitud?',
                a: 'La protectora recibe una notificación y revisará tu solicitud. Si la acepta, recibirás una notificación y la protectora se pondrá en contacto contigo directamente.',
            },
            {
                q: '¿Puedo cancelar una solicitud?',
                a: 'Sí, puedes cancelar una solicitud mientras esté en estado pendiente desde la sección "Mis solicitudes" de tu panel.',
            },
        ],
    },
    {
        icon:  '🔍',
        title: 'Compatibilidad',
        color: 'bg-emerald-50 border-emerald-200',
        headerColor: 'text-emerald-700',
        faqs: [
            {
                q: '¿Para qué sirve el perfil de compatibilidad?',
                a: 'Al completar tu perfil, el catálogo de animales se ordena automáticamente por porcentaje de compatibilidad contigo, teniendo en cuenta tu vivienda, tiempo libre, experiencia y situación en casa.',
            },
            {
                q: '¿Puedo modificar mi perfil de compatibilidad?',
                a: 'Sí, puedes actualizarlo cuando quieras desde tu panel. Los cambios se reflejan inmediatamente en el catálogo. Tienes un perfil separado para perros y otro para gatos.',
            },
        ],
    },
    {
        icon:  '💰',
        title: 'Campañas y donaciones',
        color: 'bg-violet-50 border-violet-200',
        headerColor: 'text-violet-700',
        faqs: [
            {
                q: '¿Cómo funcionan las campañas de recaudación?',
                a: 'Las protectoras crean campañas con un objetivo económico y una fecha límite. Puedes consultar el progreso y donar directamente desde la ficha de cada campaña.',
            },
            {
                q: '¿Es seguro donar con tarjeta?',
                a: 'El sistema de pago es una simulación con fines demostrativos. No se procesan pagos reales ni se almacenan datos bancarios. Para probar, usa el número 4242 4242 4242 4242 (pago exitoso) o cualquier número terminado en 0000 (pago fallido).',
            },
        ],
    },
    {
        icon:  '📅',
        title: 'Eventos y voluntariado',
        color: 'bg-sky-50 border-sky-200',
        headerColor: 'text-sky-700',
        faqs: [
            {
                q: '¿Cómo me inscribo en un evento?',
                a: 'Desde la sección Comunidad → Eventos puedes ver todos los eventos próximos y apuntarte con un clic. Puedes cancelar tu inscripción en cualquier momento desde tu panel.',
            },
            {
                q: '¿Cómo puedo ser voluntario en una protectora?',
                a: 'Entra en la ficha de cualquier protectora y pulsa "Ser voluntario". Indica tu disponibilidad, intereses y un mensaje opcional. La protectora revisará tu solicitud y si la acepta se pondrá en contacto contigo.',
            },
        ],
    },
    {
        icon:  '🏠',
        title: 'Protectoras',
        color: 'bg-amber-50 border-amber-200',
        headerColor: 'text-amber-700',
        faqs: [
            {
                q: '¿Cómo se registra una protectora?',
                a: 'Desde el menú superior accede a "Iniciar sesión" y selecciona la opción de protectoras. Desde ahí puedes registrar tu protectora con nombre, email, dirección y ubicación.',
            },
            {
                q: '¿Todas las protectoras están verificadas?',
                a: 'De momento no existe un sistema de verificación activo. Cualquier protectora puede registrarse y publicar animales. La verificación de protectoras está prevista como mejora futura.',
            },
        ],
    },
]

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left"
            >
                <span className={'text-sm font-medium transition-colors ' + (open ? 'text-gray-900' : 'text-gray-700')}>
                    {question}
                </span>
                <span className={'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all text-xs ' + (
                    open
                        ? 'bg-gray-800 text-white rotate-180'
                        : 'bg-gray-100 text-gray-500'
                )}>
                    ▼
                </span>
            </button>
            {open && (
                <p className="text-sm text-gray-600 leading-relaxed pb-4">
                    {answer}
                </p>
            )}
        </div>
    )
}

export default function HowToUse() {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">¿Cómo funciona?</h1>
                    <p className="text-indigo-100 text-lg">
                        Resolvemos tus dudas sobre cómo usar Deja tu Huella
                    </p>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="flex flex-col gap-6">
                    {sections.map(section => (
                        <div
                            key={section.title}
                            className={'rounded-2xl border p-6 ' + section.color}
                        >
                            {/* Cabecera sección */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{section.icon}</span>
                                <h2 className={'text-lg font-bold ' + section.headerColor}>
                                    {section.title}
                                </h2>
                            </div>

                            {/* Preguntas */}
                            <div className="bg-white rounded-xl px-5">
                                {section.faqs.map(faq => (
                                    <FaqItem
                                        key={faq.q}
                                        question={faq.q}
                                        answer={faq.a}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA final */}
                <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <span className="text-4xl">🐾</span>
                    <h3 className="text-xl font-bold text-gray-800 mt-3 mb-2">
                        ¿Listo para encontrar tu compañero?
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Hay cientos de animales esperando una familia como la tuya
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            to="/animals?species=dog"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                            🐕 Explorar perros
                        </Link>
                        <Link
                            to="/animals?species=cat"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                            🐈 Explorar gatos
                        </Link>
                        <Link
                            to="/shelters"
                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                            🏠 Ver protectoras
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
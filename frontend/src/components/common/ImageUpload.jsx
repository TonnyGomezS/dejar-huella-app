import { useState } from 'react'

const CLOUD_NAME = 'tu_cloud_name'
const UPLOAD_PRESET = 'tu_upload_preset'

export default function ImageUpload({ value, onChange, placeholder = 'Subir imagen' }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError]         = useState(null)

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('El fichero debe ser una imagen')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede superar 5MB')
            return
        }

        setError(null)
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', UPLOAD_PRESET)

            const res = await fetch(
                'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload',
                { method: 'POST', body: formData }
            )

            const data = await res.json()

            if (data.secure_url) {
                onChange(data.secure_url)
            } else {
                setError('Error al subir la imagen')
            }
        } catch (e) {
            setError('Error al subir la imagen')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">

            {/* Preview */}
            {value && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            )}

            {/* Botón subida */}
            <label className={'flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ' + (
                uploading
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            )}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    disabled={uploading}
                    className="hidden"
                />
                {uploading ? (
                    <>
                        <span className="text-2xl animate-bounce">⬆️</span>
                        <p className="text-sm text-gray-500">Subiendo imagen...</p>
                    </>
                ) : (
                    <>
                        <span className="text-2xl">📷</span>
                        <p className="text-sm font-medium text-gray-600">{placeholder}</p>
                        <p className="text-xs text-gray-400">PNG, JPG o WEBP · Máximo 5MB</p>
                    </>
                )}
            </label>

            {/* URL manual como alternativa */}
            <div>
                <p className="text-xs text-gray-400 mb-1.5">O pega una URL directamente</p>
                <input
                    type="url"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    )
}
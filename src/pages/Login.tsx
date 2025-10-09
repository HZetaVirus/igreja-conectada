import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background com Imagem Animada */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-zoom-slow"
          style={{
            backgroundImage: 'url(/images/background.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
          {/* Ícone de Igreja */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <span className="text-3xl">⛪</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Igreja Conectada
            </h1>
            <p className="text-gray-600 mt-2">Sistema de Gestão Eclesiástica</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white/80 text-gray-900 placeholder:text-gray-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white/80 text-gray-900 placeholder:text-gray-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Versículo */}
        <div className="mt-6 text-center">
          <p className="text-white/90 text-base italic drop-shadow-lg">
            "Onde dois ou três estiverem reunidos em meu nome, ali estou eu no meio deles."
          </p>
          <p className="text-white/70 text-sm mt-1 drop-shadow-lg">Mateus 18:20</p>
        </div>
      </div>

      {/* CSS para animação */}
      <style>{`
        @keyframes zoom-slow {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.1);
          }
        }
        .animate-zoom-slow {
          animation: zoom-slow 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

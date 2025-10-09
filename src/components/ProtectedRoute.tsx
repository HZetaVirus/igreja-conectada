import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredLevel?: 'super_admin' | 'admin'
}

export default function ProtectedRoute({ children, requiredLevel }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !usuario) {
      navigate('/login')
    }

    if (!loading && usuario && requiredLevel === 'super_admin' && usuario.nivelAcesso !== 'super_admin') {
      navigate('/dashboard')
    }
  }, [usuario, loading, navigate, requiredLevel])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  if (requiredLevel === 'super_admin' && usuario.nivelAcesso !== 'super_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Acesso negado</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

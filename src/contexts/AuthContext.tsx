import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService, verifyToken, getCurrentUser } from '../services/authService'

interface Usuario {
  id: string
  email: string
  nivelAcesso: string
  congregacaoId?: string | null
  congregacao?: {
    id: string
    nome: string
  } | null
}

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isSuperAdmin = usuario?.nivelAcesso === 'super_admin'

  useEffect(() => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      verificarToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  async function verificarToken(savedToken: string) {
    try {
      const decoded = verifyToken(savedToken)
      if (decoded) {
        const user = await getCurrentUser(decoded.id)
        if (user) {
          setUsuario(user)
          setToken(savedToken)
        } else {
          localStorage.removeItem('token')
        }
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      // Error logged
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await loginService(email, password)

      if (!response.success || !response.usuario || !response.token) {
        throw new Error(response.error || 'Erro ao fazer login')
      }

      setToken(response.token)
      setUsuario(response.usuario)
      localStorage.setItem('token', response.token)

      navigate('/dashboard')
    } catch (error: any) {
      throw error
    }
  }

  function logout() {
    setUsuario(null)
    setToken(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

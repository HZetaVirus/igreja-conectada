import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Membros from './pages/Membros'
import Dizimos from './pages/Dizimos'
import Convertidos from './pages/Convertidos'
import Departamentos from './pages/Departamentos'
import Juventude from './pages/Juventude'
import Configuracoes from './pages/Configuracoes'
import PerfilCongregacao from './pages/PerfilCongregacao'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membros"
            element={
              <ProtectedRoute>
                <Membros />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dizimos"
            element={
              <ProtectedRoute>
                <Dizimos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/convertidos"
            element={
              <ProtectedRoute>
                <Convertidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departamentos"
            element={
              <ProtectedRoute>
                <Departamentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/juventude"
            element={
              <ProtectedRoute>
                <Juventude />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil-congregacao"
            element={
              <ProtectedRoute>
                <PerfilCongregacao />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App

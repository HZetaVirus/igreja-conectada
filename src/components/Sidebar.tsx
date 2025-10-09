import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Tooltip from './Tooltip'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/membros', label: 'Membros', icon: '👥' },
  { href: '/dizimos', label: 'Dízimos e Ofertas', icon: '💰' },
  { href: '/convertidos', label: 'Novos Convertidos', icon: '✨' },
  { href: '/departamentos', label: 'Departamentos', icon: '📁' },
  { href: '/juventude', label: 'Juventude', icon: '👶' },
  { href: '/perfil-congregacao', label: 'Perfil da Congregação', icon: '⛪', adminOnly: true },
  { href: '/configuracoes', label: 'Configurações', icon: '⚙️', superAdminOnly: true },
]

export default function Sidebar() {
  const location = useLocation()
  const { usuario, logout, isSuperAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão Hamburguer - Mobile */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition"
          aria-label="Abrir menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Overlay - Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-gray-900 text-white w-64 h-screen p-4 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Igreja Conectada</h1>
            <p className="text-sm text-gray-400 mt-1">
              {isSuperAdmin ? 'Super Admin' : usuario?.congregacao?.nome || 'Admin'}
            </p>
          </div>
          {/* Botão Fechar - Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 -mt-1 -mr-1"
            aria-label="Fechar menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Ocultar "Perfil da Congregação" para super_admin
              if (item.adminOnly && isSuperAdmin) return null
              
              // Ocultar "Configurações" para não super_admin
              if (item.superAdminOnly && !isSuperAdmin) return null
              
              const isActive = location.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logado como:</p>
            <p className="text-sm font-bold truncate">{usuario?.nome || 'Usuário'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {usuario?.nivelAcesso === 'super_admin' && '👑 Super Admin'}
              {usuario?.nivelAcesso === 'admin' && '⚡ Administrador'}
              {usuario?.nivelAcesso === 'pastor' && '✝️ Pastor'}
              {usuario?.nivelAcesso === 'secretario' && '📝 Secretário'}
            </p>
            {usuario?.congregacao && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                ⛪ {usuario.congregacao.nome}
              </p>
            )}
          </div>
          <Tooltip text="Sair do sistema" position="top">
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sair
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  )
}

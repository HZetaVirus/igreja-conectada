import { useState, useEffect } from 'react'
import { getCongregacoes } from '../services/congregacoesService'

interface UsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  usuario?: any
}

export default function UsuarioModal({ isOpen, onClose, onSave, usuario }: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel_acesso: 'admin',
    congregacao_id: '',
    ativo: true,
  })
  const [congregacoes, setCongregacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCongregacoes()
    }
  }, [isOpen])

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        nivel_acesso: usuario.nivel_acesso || 'admin',
        congregacao_id: usuario.congregacao_id || '',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        senha: '',
        nivel_acesso: 'admin',
        congregacao_id: '',
        ativo: true,
      })
    }
  }, [usuario])

  async function loadCongregacoes() {
    const result = await getCongregacoes()
    if (result.success && result.data) {
      setCongregacoes(result.data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error logged
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {usuario ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Nome do pastor/administrador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="usuario@email.com"
                disabled={!!usuario}
              />
            </div>

            {!usuario && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  required={!usuario}
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Senha do usuário"
                  minLength={6}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Acesso *
              </label>
              <select
                required
                value={formData.nivel_acesso}
                onChange={(e) => setFormData({ ...formData, nivel_acesso: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="admin">Admin</option>
                <option value="lider">Líder</option>
                <option value="membro">Membro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Congregação *
              </label>
              <select
                required
                value={formData.congregacao_id}
                onChange={(e) => setFormData({ ...formData, congregacao_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione uma congregação</option>
                {congregacoes.map((cong) => (
                  <option key={cong.id} value={cong.id}>
                    {cong.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                Usuário ativo
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

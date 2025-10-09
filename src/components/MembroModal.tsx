import { useState, useEffect } from 'react'
import { CreateMembroData } from '../services/membrosService'
import { getCongregacoes } from '../services/congregacoesService'

interface MembroModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateMembroData) => Promise<void>
  membro?: any
  congregacaoId?: string
}

export default function MembroModal({ isOpen, onClose, onSave, membro, congregacaoId }: MembroModalProps) {
  const [formData, setFormData] = useState<CreateMembroData>({
    nome: '',
    data_nascimento: '',
    cargo: '',
    status_espiritual: 'ativo',
    congregacao_id: congregacaoId || '',
    telefone: '',
    email: '',
    endereco: '',
    data_batismo: '',
    carta_bencao: '',
    origem_membro: '',
    congregacao_origem: '',
  })
  const [loading, setLoading] = useState(false)
  const [congregacoes, setCongregacoes] = useState<any[]>([])
  const isSuperAdmin = !congregacaoId

  useEffect(() => {
    if (isSuperAdmin) {
      loadCongregacoes()
    }
  }, [isSuperAdmin])

  async function loadCongregacoes() {
    const result = await getCongregacoes()
    if (result.success && result.data) {
      setCongregacoes(result.data)
    }
  }

  useEffect(() => {
    if (membro) {
      setFormData({
        nome: membro.nome || '',
        data_nascimento: membro.data_nascimento || '',
        cargo: membro.cargo || '',
        status_espiritual: membro.status_espiritual || 'ativo',
        congregacao_id: membro.congregacao_id || congregacaoId,
        telefone: membro.telefone || '',
        email: membro.email || '',
        endereco: membro.endereco || '',
        data_batismo: membro.data_batismo || '',
        carta_bencao: membro.carta_bencao || '',
        origem_membro: membro.origem_membro || '',
        congregacao_origem: membro.congregacao_origem || '',
      })
    } else {
      setFormData({
        nome: '',
        data_nascimento: '',
        cargo: '',
        status_espiritual: 'ativo',
        congregacao_id: congregacaoId || '',
        telefone: '',
        email: '',
        endereco: '',
        data_batismo: '',
        carta_bencao: '',
        origem_membro: '',
        congregacao_origem: '',
      })
    }
  }, [membro, congregacaoId])

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {membro ? 'Editar Membro' : 'Novo Membro'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              {isSuperAdmin && (
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Congregação *
                  </label>
                  <select
                    required
                    value={formData.congregacao_id || ''}
                    onChange={(e) => setFormData({ ...formData, congregacao_id: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="">Selecione uma congregação</option>
                    {congregacoes.map((cong) => (
                      <option key={cong.id} value={cong.id}>
                        {cong.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Ex: Diácono, Pastor, Membro"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Status Espiritual *
                </label>
                <select
                  required
                  value={formData.status_espiritual}
                  onChange={(e) => setFormData({ ...formData, status_espiritual: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="visitante">Visitante</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Endereço
                </label>
                <textarea
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              {/* Novos Campos */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Data de Batismo
                </label>
                <input
                  type="date"
                  value={formData.data_batismo || ''}
                  onChange={(e) => setFormData({ ...formData, data_batismo: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Possui Carta de Benção Apostólica?
                </label>
                <select
                  value={formData.carta_bencao || ''}
                  onChange={(e) => setFormData({ ...formData, carta_bencao: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Origem do Membro
                </label>
                <select
                  value={formData.origem_membro || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, origem_membro: e.target.value })
                    // Limpar congregação de origem se for evangelismo
                    if (e.target.value === 'evangelismo') {
                      setFormData(prev => ({ ...prev, congregacao_origem: '' }))
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="evangelismo">Novo Convertido (Evangelismo)</option>
                  <option value="transferencia">Transferência de Outra Congregação</option>
                </select>
              </div>

              {formData.origem_membro === 'transferencia' && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Congregação de Origem
                  </label>
                  <input
                    type="text"
                    value={formData.congregacao_origem || ''}
                    onChange={(e) => setFormData({ ...formData, congregacao_origem: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Nome da congregação anterior"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
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

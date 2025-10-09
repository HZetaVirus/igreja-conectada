import { useState, useEffect } from 'react'
import { CreateConvertidoData } from '../services/convertidosService'
import { getMembros } from '../services/membrosService'
import { getCongregacoes } from '../services/congregacoesService'

interface ConvertidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateConvertidoData) => Promise<void>
  convertido?: any
  congregacaoId?: string
}

export default function ConvertidoModal({ isOpen, onClose, onSave, convertido, congregacaoId }: ConvertidoModalProps) {
  const [formData, setFormData] = useState<CreateConvertidoData>({
    nome: '',
    data_conversao: new Date().toISOString().split('T')[0],
    discipulador_id: '',
    congregacao_id: congregacaoId || '',
    status_etapa: 'iniciado',
    telefone: '',
    observacoes: '',
  })
  const [membros, setMembros] = useState<any[]>([])
  const [congregacoes, setCongregacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
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
    if (isOpen) {
      loadMembros()
    }
    
    if (convertido) {
      setFormData({
        nome: convertido.nome || '',
        data_conversao: convertido.data_conversao || new Date().toISOString().split('T')[0],
        discipulador_id: convertido.discipulador_id || '',
        congregacao_id: convertido.congregacao_id || congregacaoId,
        status_etapa: convertido.status_etapa || 'iniciado',
        telefone: convertido.telefone || '',
        observacoes: convertido.observacoes || '',
      })
    } else {
      setFormData({
        nome: '',
        data_conversao: new Date().toISOString().split('T')[0],
        discipulador_id: '',
        congregacao_id: congregacaoId,
        status_etapa: 'iniciado',
        telefone: '',
        observacoes: '',
      })
    }
  }, [isOpen, convertido, congregacaoId])

  async function loadMembros() {
    const result = await getMembros(congregacaoId)
    if (result.success && result.data) {
      // Filtrar apenas membros ativos
      const membrosAtivos = result.data.filter(m => m.status_espiritual === 'ativo')
      setMembros(membrosAtivos)
    }
  }

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {convertido ? 'Editar Convertido' : 'Novo Convertido'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Nome do novo convertido"
                />
              </div>

              {isSuperAdmin && (
                <div className="md:col-span-2">
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
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Conversão *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_conversao}
                  onChange={(e) => setFormData({ ...formData, data_conversao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discipulador
                </label>
                <select
                  value={formData.discipulador_id}
                  onChange={(e) => setFormData({ ...formData, discipulador_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione um discipulador</option>
                  {membros.map((membro) => (
                    <option key={membro.id} value={membro.id}>
                      {membro.nome} {membro.cargo ? `(${membro.cargo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Discipulado *
                </label>
                <select
                  required
                  value={formData.status_etapa}
                  onChange={(e) => setFormData({ ...formData, status_etapa: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="iniciado">Iniciado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Informações adicionais sobre o discipulado..."
                />
              </div>
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

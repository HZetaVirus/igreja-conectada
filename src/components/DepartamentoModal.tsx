import { useState, useEffect } from 'react'
import { CreateDepartamentoData } from '../services/departamentosService'
import { getMembros } from '../services/membrosService'

interface DepartamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDepartamentoData) => Promise<void>
  departamento?: any
  congregacaoId: string
}

const cores = [
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Amarelo', valor: '#eab308' },
  { nome: 'Ciano', valor: '#06b6d4' },
]

export default function DepartamentoModal({ isOpen, onClose, onSave, departamento, congregacaoId }: DepartamentoModalProps) {
  const [formData, setFormData] = useState<CreateDepartamentoData>({
    nome: '',
    descricao: '',
    responsavel_id: '',
    congregacao_id: congregacaoId,
    cor: '#3b82f6',
    ativo: true,
    apenas_juventude: false,
  })
  const [membros, setMembros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMembros()
    }
    
    if (departamento) {
      setFormData({
        nome: departamento.nome || '',
        descricao: departamento.descricao || '',
        responsavel_id: departamento.responsavel_id || '',
        congregacao_id: departamento.congregacao_id || congregacaoId,
        cor: departamento.cor || '#3b82f6',
        ativo: departamento.ativo !== undefined ? departamento.ativo : true,
        apenas_juventude: departamento.apenas_juventude || false,
      })
    } else {
      setFormData({
        nome: '',
        descricao: '',
        responsavel_id: '',
        congregacao_id: congregacaoId,
        cor: '#3b82f6',
        ativo: true,
        apenas_juventude: false,
      })
    }
  }, [isOpen, departamento, congregacaoId])

  async function loadMembros() {
    const result = await getMembros(congregacaoId)
    if (result.success && result.data) {
      const membrosAtivos = result.data.filter(m => m.status_espiritual === 'ativo')
      setMembros(membrosAtivos)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Converter string vazia para null em campos UUID
      const dataToSave: any = {
        ...formData,
        responsavel_id: formData.responsavel_id || null,
      }
      await onSave(dataToSave)
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
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {departamento ? 'Editar Departamento' : 'Novo Departamento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Nome do Departamento *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Ex: Louvor, Jovens, Crianças..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                rows={3}
                placeholder="Descreva as atividades e objetivos do departamento..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Responsável
              </label>
              <select
                value={formData.responsavel_id}
                onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione um responsável</option>
                {membros.map((membro) => (
                  <option key={membro.id} value={membro.id}>
                    {membro.nome} {membro.cargo ? `(${membro.cargo})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Cor do Departamento
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {cores.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setFormData({ ...formData, cor: cor.valor })}
                    className={`w-full aspect-square rounded-lg transition ${
                      formData.cor === cor.valor
                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="ativo" className="text-xs sm:text-sm text-gray-700">
                  Departamento ativo
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="apenas_juventude"
                  checked={formData.apenas_juventude}
                  onChange={(e) => setFormData({ ...formData, apenas_juventude: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="apenas_juventude" className="text-xs sm:text-sm text-gray-700">
                  👶 Apenas Juventude (mostra somente crianças/adolescentes)
                </label>
              </div>
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

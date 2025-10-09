import { useState, useEffect } from 'react'
import { CreateDizimoData } from '../services/dizimosService'
import { getMembros } from '../services/membrosService'

interface DizimoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDizimoData) => Promise<void>
  congregacaoId: string
}

export default function DizimoModal({ isOpen, onClose, onSave, congregacaoId }: DizimoModalProps) {
  const [formData, setFormData] = useState<CreateDizimoData>({
    membro_id: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    tipo: 'dizimo',
    congregacao_id: congregacaoId,
    observacao: '',
  })
  const [membros, setMembros] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMembros()
    }
  }, [isOpen, congregacaoId])

  async function loadMembros() {
    const result = await getMembros(congregacaoId)
    if (result.success && result.data) {
      setMembros(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      setFormData({
        membro_id: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        tipo: 'dizimo',
        congregacao_id: congregacaoId,
        observacao: '',
      })
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Registrar Contribuição</h2>
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
                Tipo *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'dizimo' | 'oferta' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="dizimo">Dízimo</option>
                <option value="oferta">Oferta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membro *
              </label>
              <select
                required
                value={formData.membro_id}
                onChange={(e) => setFormData({ ...formData, membro_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione um membro</option>
                {membros.map((membro) => (
                  <option key={membro.id} value={membro.id}>
                    {membro.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                rows={2}
                placeholder="Observações adicionais..."
              />
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

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import DizimoModal from '../components/DizimoModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  getDizimos,
  createDizimo,
  deleteDizimo,
  getTotalizadores,
  CreateDizimoData,
} from '../services/dizimosService'
import { exportarDizimosCSV, exportarDizimosPDF } from '../services/relatoriosService'

export default function Dizimos() {
  const { usuario, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [dizimos, setDizimos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [totais, setTotais] = useState({ dizimos: 0, ofertas: 0, total: 0 })
  const [filterTipo, setFilterTipo] = useState('todos')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadDizimos()
    loadTotalizadores()
  }, [usuario, startDate, endDate])

  async function loadDizimos() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getDizimos(congregacaoId, startDate, endDate)
    
    if (result.success && result.data) {
      setDizimos(result.data)
    }
    setLoading(false)
  }

  async function loadTotalizadores() {
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getTotalizadores(congregacaoId, startDate, endDate)
    
    if (result.success && result.data) {
      setTotais(result.data)
    }
  }

  async function handleSave(data: CreateDizimoData) {
    try {
      const result = await createDizimo(data)
      if (result.success) {
        toast.success('Contribuição registrada com sucesso!')
        loadDizimos()
        loadTotalizadores()
      } else {
        toast.error(result.error || 'Erro ao registrar contribuição')
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar contribuição')
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        const result = await deleteDizimo(id)
        if (result.success) {
          toast.success('Registro excluído com sucesso!')
          loadDizimos()
          loadTotalizadores()
        } else {
          toast.error(result.error || 'Erro ao excluir registro')
        }
      } catch (error) {
        toast.error('Erro inesperado ao excluir registro')
      }
    }
  }

  const filteredDizimos = dizimos.filter((dizimo) => {
    if (filterTipo === 'todos') return true
    return dizimo.tipo === filterTipo
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dízimos e Ofertas</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Controle financeiro da congregação</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative group">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span>📥</span>
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportarDizimosCSV(filteredDizimos, 'dizimos')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg text-sm"
                >
                  📄 Exportar CSV
                </button>
                <button
                  onClick={() => {
                    const periodo = startDate && endDate ? { inicio: startDate, fim: endDate } : undefined
                    exportarDizimosPDF(filteredDizimos, usuario?.congregacao?.nome || 'Todas', periodo)
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-sm"
                >
                  📑 Exportar PDF
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span className="text-lg sm:text-xl">+</span>
              <span className="hidden xs:inline">Nova Contribuição</span>
              <span className="xs:hidden">Nova</span>
            </button>
          </div>
        </div>

        {/* Cards de Totalizadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total de Dízimos</p>
                <p className="text-xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2 truncate">
                  R$ {totais.dizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-2xl sm:text-4xl flex-shrink-0 ml-2">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total de Ofertas</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2 truncate">
                  R$ {totais.ofertas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-2xl sm:text-4xl flex-shrink-0 ml-2">🎁</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Geral</p>
                <p className="text-xl sm:text-3xl font-bold text-primary-600 mt-1 sm:mt-2 truncate">
                  R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-2xl sm:text-4xl flex-shrink-0 ml-2">📊</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filtrar por tipo
              </label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="dizimo">Dízimos</option>
                <option value="oferta">Ofertas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lista de Contribuições */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Carregando contribuições...</p>
          </div>
        ) : filteredDizimos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">Nenhuma contribuição encontrada</p>
          </div>
        ) : (
          <>
            {/* Tabela para Desktop */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membro
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observação
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDizimos.map((dizimo) => (
                    <tr key={dizimo.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(dizimo.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            dizimo.tipo === 'dizimo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {dizimo.tipo === 'dizimo' ? 'Dízimo' : 'Oferta'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dizimo.membro?.nome || 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {Number(dizimo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {dizimo.observacao || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(dizimo.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para Mobile */}
            <div className="md:hidden space-y-3">
              {filteredDizimos.map((dizimo) => (
                <div key={dizimo.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(dizimo.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="font-medium text-gray-900 mt-1">
                        {dizimo.membro?.nome || 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        dizimo.tipo === 'dizimo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {dizimo.tipo === 'dizimo' ? 'Dízimo' : 'Oferta'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">
                      R$ {Number(dizimo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleDelete(dizimo.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                  
                  {dizimo.observacao && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {dizimo.observacao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        <DizimoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          congregacaoId={usuario?.congregacaoId || '00000000-0000-0000-0000-000000000001'}
        />
      </div>
    </Layout>
  )
}

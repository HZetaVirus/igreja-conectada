import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import ConvertidoModal from '../components/ConvertidoModal'
import InformacoesFamiliaresModal from '../components/InformacoesFamiliaresModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  getConvertidos,
  createConvertido,
  updateConvertido,
  deleteConvertido,
  CreateConvertidoData,
} from '../services/convertidosService'
import { exportarConvertidosCSV, exportarConvertidosPDF } from '../services/relatoriosService'
import { atualizarInformacoesFamiliares, DadosFamiliares } from '../services/familiasService'

export default function Convertidos() {
  const { usuario, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [convertidos, setConvertidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConvertido, setSelectedConvertido] = useState<any | null>(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPeriodo, setFilterPeriodo] = useState('todos')
  
  // Modal de informações familiares
  const [isInfoFamiliarModalOpen, setIsInfoFamiliarModalOpen] = useState(false)
  const [convertidoRecemCriado, setConvertidoRecemCriado] = useState<any | null>(null)

  useEffect(() => {
    loadConvertidos()
  }, [usuario])

  async function loadConvertidos() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getConvertidos(congregacaoId)
    
    if (result.success && result.data) {
      setConvertidos(result.data)
    }
    setLoading(false)
  }

  async function handleSave(data: CreateConvertidoData) {
    try {
      if (selectedConvertido) {
        const result = await updateConvertido(selectedConvertido.id, data)
        if (result.success) {
          toast.success('Convertido atualizado com sucesso!')
          loadConvertidos()
          closeModal()
        } else {
          toast.error(result.error || 'Erro ao atualizar convertido')
        }
      } else {
        const result = await createConvertido(data)
        if (result.success && result.data) {
          toast.success('Convertido cadastrado com sucesso!')
          loadConvertidos()
          closeModal()
          
          // Abrir modal de informações familiares
          setConvertidoRecemCriado(result.data)
          setIsInfoFamiliarModalOpen(true)
        } else {
          toast.error(result.error || 'Erro ao cadastrar convertido')
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar convertido')
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este convertido?')) {
      try {
        const result = await deleteConvertido(id)
        if (result.success) {
          toast.success('Convertido excluído com sucesso!')
          loadConvertidos()
        } else {
          toast.error(result.error || 'Erro ao excluir convertido')
        }
      } catch (error) {
        toast.error('Erro inesperado ao excluir convertido')
      }
    }
  }

  function openModal(convertido?: any) {
    setSelectedConvertido(convertido || null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedConvertido(null)
  }

  async function handleSaveInfoFamiliares(dados: DadosFamiliares) {
    if (!convertidoRecemCriado) return

    const result = await atualizarInformacoesFamiliares(convertidoRecemCriado.id, dados)
    if (result.success) {
      toast.success('Informações familiares salvas com sucesso!')
      setIsInfoFamiliarModalOpen(false)
      setConvertidoRecemCriado(null)
      loadConvertidos()
    } else {
      toast.error(result.error || 'Erro ao salvar informações familiares')
    }
  }

  function closeInfoFamiliarModal() {
    setIsInfoFamiliarModalOpen(false)
    setConvertidoRecemCriado(null)
  }

  // Filtrar por status
  const filteredByStatus = convertidos.filter((convertido) => {
    if (filterStatus === 'todos') return true
    return convertido.status_etapa === filterStatus
  })

  // Filtrar por período
  const filteredConvertidos = filteredByStatus.filter((convertido) => {
    if (filterPeriodo === 'todos') return true
    
    const dataConversao = new Date(convertido.data_conversao)
    const hoje = new Date()
    const diffDias = Math.floor((hoje.getTime() - dataConversao.getTime()) / (1000 * 60 * 60 * 24))
    
    if (filterPeriodo === '30dias') return diffDias <= 30
    if (filterPeriodo === '60dias') return diffDias <= 60
    if (filterPeriodo === '90dias') return diffDias <= 90
    
    return true
  })

  // Estatísticas
  const stats = {
    total: convertidos.length,
    iniciado: convertidos.filter(c => c.status_etapa === 'iniciado').length,
    emAndamento: convertidos.filter(c => c.status_etapa === 'em_andamento').length,
    concluido: convertidos.filter(c => c.status_etapa === 'concluido').length,
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Novos Convertidos</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              {filteredConvertidos.length} {filteredConvertidos.length === 1 ? 'convertido' : 'convertidos'}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative group">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span>📥</span>
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportarConvertidosCSV(filteredConvertidos, 'convertidos')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg text-sm"
                >
                  📄 Exportar CSV
                </button>
                <button
                  onClick={() => exportarConvertidosPDF(filteredConvertidos, usuario?.congregacao?.nome || 'Todas')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-sm"
                >
                  📑 Exportar PDF
                </button>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span className="text-lg sm:text-xl">+</span>
              <span className="hidden xs:inline">Novo Convertido</span>
              <span className="xs:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.total}</p>
              </div>
              <div className="text-2xl sm:text-4xl">✨</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Iniciado</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{stats.iniciado}</p>
              </div>
              <div className="text-2xl sm:text-4xl">🌱</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Andamento</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{stats.emAndamento}</p>
              </div>
              <div className="text-2xl sm:text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Concluído</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{stats.concluido}</p>
              </div>
              <div className="text-2xl sm:text-4xl">🎓</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filtrar por status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="iniciado">Iniciado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filtrar por período
              </label>
              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="60dias">Últimos 60 dias</option>
                <option value="90dias">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Convertidos */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Carregando convertidos...</p>
          </div>
        ) : filteredConvertidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">Nenhum convertido encontrado</p>
            <button
              onClick={() => openModal()}
              className="mt-3 sm:mt-4 text-primary-600 hover:text-primary-700 text-sm sm:text-base"
            >
              Cadastrar primeiro convertido
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredConvertidos.map((convertido) => (
              <div key={convertido.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-lg sm:text-xl flex-shrink-0">
                      {convertido.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{convertido.nome}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(convertido.data_conversao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ml-2 ${
                      convertido.status_etapa === 'iniciado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : convertido.status_etapa === 'em_andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {convertido.status_etapa === 'iniciado' && 'Iniciado'}
                    {convertido.status_etapa === 'em_andamento' && 'Andamento'}
                    {convertido.status_etapa === 'concluido' && 'Concluído'}
                  </span>
                </div>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {convertido.telefone && (
                    <p className="flex items-center gap-2 truncate">
                      <span className="flex-shrink-0">📞</span> 
                      <span className="truncate">{convertido.telefone}</span>
                    </p>
                  )}
                  {convertido.discipulador && (
                    <p className="flex items-center gap-2 truncate">
                      <span className="flex-shrink-0">👤</span> 
                      <span className="truncate">Disc: {convertido.discipulador.nome}</span>
                    </p>
                  )}
                  {!convertido.discipulador && (
                    <p className="flex items-center gap-2 text-orange-600">
                      <span className="flex-shrink-0">⚠️</span> Sem discipulador
                    </p>
                  )}
                  {convertido.observacoes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {convertido.observacoes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(convertido)}
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition text-xs sm:text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(convertido.id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs sm:text-sm font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Cadastro/Edição */}
        <ConvertidoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          convertido={selectedConvertido}
          congregacaoId={usuario?.congregacaoId || undefined}
        />

        {/* Modal de Informações Familiares */}
        <InformacoesFamiliaresModal
          isOpen={isInfoFamiliarModalOpen}
          onClose={closeInfoFamiliarModal}
          onSave={handleSaveInfoFamiliares}
          congregacaoId={usuario?.congregacaoId || undefined}
          membroNome={convertidoRecemCriado?.nome || ''}
        />
      </div>
    </Layout>
  )
}

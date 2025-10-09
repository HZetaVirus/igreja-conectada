import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import MembroModal from '../components/MembroModal'
import InformacoesFamiliaresModal from '../components/InformacoesFamiliaresModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  getMembros,
  createMembro,
  updateMembro,
  deleteMembro,
  searchMembros,
  CreateMembroData,
} from '../services/membrosService'
import { exportarMembrosCSV, exportarMembrosPDF } from '../services/relatoriosService'
import { atualizarInformacoesFamiliares, DadosFamiliares } from '../services/familiasService'

export default function Membros() {
  const { usuario, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [membros, setMembros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMembro, setSelectedMembro] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  
  // Modal de informações familiares
  const [isInfoFamiliarModalOpen, setIsInfoFamiliarModalOpen] = useState(false)
  const [membroRecemCriado, setMembroRecemCriado] = useState<any | null>(null)

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  })

  useEffect(() => {
    loadMembros()
  }, [usuario])

  async function loadMembros() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getMembros(congregacaoId)
    
    if (result.success && result.data) {
      setMembros(result.data)
    }
    setLoading(false)
  }

  async function handleSearch(term: string) {
    setSearchTerm(term)
    if (term.trim() === '') {
      loadMembros()
      return
    }

    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await searchMembros(term, congregacaoId)
    
    if (result.success && result.data) {
      setMembros(result.data)
    }
  }

  async function handleSave(data: CreateMembroData) {
    try {
      if (selectedMembro) {
        const result = await updateMembro({ ...data, id: selectedMembro.id })
        if (result.success) {
          toast.success('Membro atualizado com sucesso!')
          loadMembros()
          closeModal()
        } else {
          toast.error(result.error || 'Erro ao atualizar membro')
        }
      } else {
        const result = await createMembro(data)
        if (result.success && result.data) {
          toast.success('Membro cadastrado com sucesso!')
          loadMembros()
          closeModal()
          
          // Abrir modal de informações familiares
          setMembroRecemCriado(result.data)
          setIsInfoFamiliarModalOpen(true)
        } else {
          toast.error(result.error || 'Erro ao cadastrar membro')
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar membro')
    }
  }

  async function handleSaveInfoFamiliares(dados: DadosFamiliares) {
    if (!membroRecemCriado) return

    const result = await atualizarInformacoesFamiliares(membroRecemCriado.id, dados)
    if (result.success) {
      toast.success('Informações familiares salvas com sucesso!')
      setIsInfoFamiliarModalOpen(false)
      setMembroRecemCriado(null)
      loadMembros()
    } else {
      toast.error(result.error || 'Erro ao salvar informações familiares')
    }
  }

  function closeInfoFamiliarModal() {
    setIsInfoFamiliarModalOpen(false)
    setMembroRecemCriado(null)
  }

  async function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Membro',
      message: 'Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteMembro(id)
          if (result.success) {
            toast.success('Membro excluído com sucesso!')
            loadMembros()
          } else {
            toast.error(result.error || 'Erro ao excluir membro')
          }
        } catch (error) {
          toast.error('Erro inesperado ao excluir membro')
        }
      }
    })
  }

  function openModal(membro?: Membro) {
    setSelectedMembro(membro || null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedMembro(null)
  }

  const filteredMembros = membros.filter((membro) => {
    if (filterStatus === 'todos') return true
    return membro.status_espiritual === filterStatus
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Membros</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              {filteredMembros.length} {filteredMembros.length === 1 ? 'membro' : 'membros'}
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
                  onClick={() => exportarMembrosCSV(filteredMembros, 'membros')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg text-sm"
                >
                  📄 Exportar CSV
                </button>
                <button
                  onClick={() => exportarMembrosPDF(filteredMembros, usuario?.congregacao?.nome || 'Todas')}
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
              <span className="hidden xs:inline">Novo Membro</span>
              <span className="xs:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Buscar por nome
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digite o nome..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
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
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
                <option value="visitante">Visitantes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Membros */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Carregando membros...</p>
          </div>
        ) : filteredMembros.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">Nenhum membro encontrado</p>
            <button
              onClick={() => openModal()}
              className="mt-3 sm:mt-4 text-primary-600 hover:text-primary-700 text-sm sm:text-base"
            >
              Cadastrar primeiro membro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMembros.map((membro) => (
              <div key={membro.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg sm:text-xl flex-shrink-0">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{membro.nome}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{membro.cargo || 'Membro'}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ml-2 ${
                      membro.status_espiritual === 'ativo'
                        ? 'bg-green-100 text-green-800'
                        : membro.status_espiritual === 'inativo'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {membro.status_espiritual}
                  </span>
                </div>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {membro.telefone && (
                    <p className="flex items-center gap-2 truncate">
                      <span className="flex-shrink-0">📞</span> 
                      <span className="truncate">{membro.telefone}</span>
                    </p>
                  )}
                  {membro.email && (
                    <p className="flex items-center gap-2 truncate">
                      <span className="flex-shrink-0">✉️</span> 
                      <span className="truncate">{membro.email}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="flex-shrink-0">🎂</span> 
                    <span>{new Date(membro.data_nascimento).toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(membro)}
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition text-xs sm:text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(membro.id)}
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
        <MembroModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          membro={selectedMembro}
          congregacaoId={usuario?.congregacaoId}
        />

        {/* Modal de Informações Familiares */}
        <InformacoesFamiliaresModal
          isOpen={isInfoFamiliarModalOpen}
          onClose={closeInfoFamiliarModal}
          onSave={handleSaveInfoFamiliares}
          congregacaoId={usuario?.congregacaoId}
          membroNome={membroRecemCriado?.nome || ''}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
        />
      </div>
    </Layout>
  )
}

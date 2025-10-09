import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import DepartamentoModal from '../components/DepartamentoModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  getDepartamentos,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  getMembrosEJuventudeDepartamento,
  getMembrosEJuventudeDisponiveis,
  addMembroToDepartamento,
  removeMembroFromDepartamento,
  CreateDepartamentoData,
  Departamento,
} from '../services/departamentosService'

export default function Departamentos() {
  const { usuario, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal de membros
  const [isMembroModalOpen, setIsMembroModalOpen] = useState(false)
  const [selectedDeptForMembros, setSelectedDeptForMembros] = useState<Departamento | null>(null)
  const [membrosDept, setMembrosDept] = useState<any[]>([])
  const [membrosDisponiveis, setMembrosDisponiveis] = useState<any[]>([])
  const [loadingMembros, setLoadingMembros] = useState(false)

  // Confirm dialogs
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
    loadDepartamentos()
  }, [usuario])

  async function loadDepartamentos() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getDepartamentos(congregacaoId)
    
    if (result.success && result.data) {
      setDepartamentos(result.data)
    }
    setLoading(false)
  }

  async function handleSave(data: CreateDepartamentoData) {
    try {
      if (selectedDepartamento) {
        const result = await updateDepartamento(selectedDepartamento.id, data)
        if (result.success) {
          toast.success('Departamento atualizado com sucesso!')
          loadDepartamentos()
        } else {
          toast.error(result.error || 'Erro ao atualizar departamento')
        }
      } else {
        const result = await createDepartamento(data)
        if (result.success) {
          toast.success('Departamento criado com sucesso!')
          loadDepartamentos()
        } else {
          toast.error(result.error || 'Erro ao criar departamento')
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar departamento')
    }
  }

  async function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Departamento',
      message: 'Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteDepartamento(id)
          if (result.success) {
            toast.success('Departamento excluído com sucesso!')
            loadDepartamentos()
          } else {
            toast.error(result.error || 'Erro ao excluir departamento')
          }
        } catch (error) {
          toast.error('Erro inesperado ao excluir departamento')
        }
      }
    })
  }

  function openModal(departamento?: Departamento) {
    setSelectedDepartamento(departamento || null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedDepartamento(null)
  }

  async function openMembrosModal(departamento: Departamento) {
    setSelectedDeptForMembros(departamento)
    setIsMembroModalOpen(true)
    setLoadingMembros(true)

    // Carregar membros e juventude do departamento
    const resultMembros = await getMembrosEJuventudeDepartamento(departamento.id)
    if (resultMembros.success && resultMembros.data) {
      setMembrosDept(resultMembros.data)
    }

    // Carregar membros e juventude disponíveis
    const resultDisponiveis = await getMembrosEJuventudeDisponiveis(departamento.congregacao_id, departamento.id)
    if (resultDisponiveis.success && resultDisponiveis.data) {
      setMembrosDisponiveis(resultDisponiveis.data)
    }

    setLoadingMembros(false)
  }

  function closeMembrosModal() {
    setIsMembroModalOpen(false)
    setSelectedDeptForMembros(null)
    setMembrosDept([])
    setMembrosDisponiveis([])
  }

  async function handleAddMembro(membroId: string, tipoIntegrante: 'membro' | 'juventude' = 'membro') {
    if (!selectedDeptForMembros) return

    const result = await addMembroToDepartamento(membroId, selectedDeptForMembros.id, undefined, tipoIntegrante)
    if (result.success) {
      toast.success('Integrante adicionado ao departamento!')
      openMembrosModal(selectedDeptForMembros)
      loadDepartamentos()
    } else {
      toast.error(result.error || 'Erro ao adicionar integrante')
    }
  }

  async function handleRemoveMembro(membroId: string) {
    if (!selectedDeptForMembros) return

    setConfirmDialog({
      isOpen: true,
      title: 'Remover Integrante',
      message: 'Tem certeza que deseja remover este integrante do departamento?',
      variant: 'warning',
      onConfirm: async () => {
        const result = await removeMembroFromDepartamento(membroId, selectedDeptForMembros.id)
        if (result.success) {
          toast.success('Integrante removido do departamento!')
          openMembrosModal(selectedDeptForMembros)
          loadDepartamentos()
        } else {
          toast.error(result.error || 'Erro ao remover integrante')
        }
      }
    })
  }

  const departamentosAtivos = departamentos.filter(d => d.ativo)
  const totalMembros = departamentos.reduce((acc, d) => acc + (d._count?.membros || 0), 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Departamentos</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              {departamentosAtivos.length} {departamentosAtivos.length === 1 ? 'departamento' : 'departamentos'} • {totalMembros} {totalMembros === 1 ? 'integrante' : 'integrantes'}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                <span className="hidden sm:inline">Grade</span>
                <span className="sm:hidden">📊</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                <span className="hidden sm:inline">Lista</span>
                <span className="sm:hidden">📋</span>
              </button>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span className="text-lg sm:text-xl">+</span>
              <span className="hidden xs:inline">Novo Departamento</span>
              <span className="xs:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{departamentos.length}</p>
              </div>
              <div className="text-2xl sm:text-4xl">📁</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Ativos</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{departamentosAtivos.length}</p>
              </div>
              <div className="text-2xl sm:text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Integrantes</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{totalMembros}</p>
              </div>
              <div className="text-2xl sm:text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Média</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">
                  {departamentosAtivos.length > 0 ? Math.round(totalMembros / departamentosAtivos.length) : 0}
                </p>
              </div>
              <div className="text-2xl sm:text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Lista de Departamentos */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Carregando departamentos...</p>
          </div>
        ) : departamentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">Nenhum departamento encontrado</p>
            <button
              onClick={() => openModal()}
              className="mt-3 sm:mt-4 text-primary-600 hover:text-primary-700 text-sm sm:text-base"
            >
              Criar primeiro departamento
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {departamentos.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6 border-t-4"
                style={{ borderTopColor: dept.cor }}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{dept.nome}</h3>
                    {dept.responsavel && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                        👤 {dept.responsavel.nome}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                      dept.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dept.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {dept.descricao && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {dept.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600">Integrantes</span>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: dept.cor }}>
                    {dept._count?.membros || 0}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openMembrosModal(dept)}
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs sm:text-sm font-medium"
                  >
                    Membros
                  </button>
                  <button
                    onClick={() => openModal(dept)}
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition text-xs sm:text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs sm:text-sm font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Departamento
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Responsável
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Integrantes
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departamentos.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dept.cor }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{dept.nome}</p>
                          {dept.descricao && (
                            <p className="text-xs text-gray-500 truncate">{dept.descricao}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                      {dept.responsavel?.nome || '-'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      <span className="text-sm font-bold" style={{ color: dept.cor }}>
                        {dept._count?.membros || 0}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          dept.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dept.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openMembrosModal(dept)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Membros
                        </button>
                        <button
                          onClick={() => openModal(dept)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Departamento */}
        <DepartamentoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          departamento={selectedDepartamento}
          congregacaoId={usuario?.congregacaoId || '00000000-0000-0000-0000-000000000001'}
        />

        {/* Modal de Membros do Departamento */}
        {isMembroModalOpen && selectedDeptForMembros && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Membros - {selectedDeptForMembros.nome}
                    </h2>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p>
                        {membrosDept.length} {membrosDept.length === 1 ? 'integrante' : 'integrantes'}
                      </p>
                      {selectedDeptForMembros.responsavel && (
                        <p className="flex items-center gap-1">
                          <span>👤</span>
                          <span className="font-medium">Responsável:</span>
                          <span>{selectedDeptForMembros.responsavel.nome}</span>
                        </p>
                      )}
                      {selectedDeptForMembros.descricao && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          {selectedDeptForMembros.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeMembrosModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl ml-4 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>

                {loadingMembros ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Membros Atuais */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Integrantes Atuais</h3>
                      {membrosDept.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum integrante neste departamento</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {membrosDept.map((md: any) => {
                            const membro = md.membro
                            const idade = membro?.data_nascimento 
                              ? new Date().getFullYear() - new Date(membro.data_nascimento).getFullYear()
                              : null
                            const isJuventude = membro?.tipo === 'juventude'

                            return (
                              <div
                                key={md.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                                    isJuventude ? 'bg-blue-100 text-blue-600' : 'bg-primary-100 text-primary-600'
                                  }`}>
                                    {membro?.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {membro?.nome}
                                      {isJuventude && (
                                        <span className="ml-1 text-xs text-blue-600">👶</span>
                                      )}
                                    </p>
                                    <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                      {idade && (
                                        <span>🎂 {idade} anos</span>
                                      )}
                                      {md.cargo_departamento && (
                                        <span>• {md.cargo_departamento}</span>
                                      )}
                                      {isJuventude && membro.responsaveis && (
                                        <span className="text-xs text-gray-400">
                                          {membro.responsaveis.pai && `Pai: ${membro.responsaveis.pai}`}
                                          {membro.responsaveis.pai && membro.responsaveis.mae && ' • '}
                                          {membro.responsaveis.mae && `Mãe: ${membro.responsaveis.mae}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveMembro(md.membro_id)}
                                  className="text-red-600 hover:text-red-900 text-sm ml-2 flex-shrink-0"
                                >
                                  Remover
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Adicionar Membros */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Adicionar Integrantes</h3>
                      {membrosDisponiveis.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 text-sm mb-2">Nenhum membro disponível</p>
                          <p className="text-xs text-gray-400">
                            Cadastre membros primeiro na página "Membros"
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                          {membrosDisponiveis.map((membro: any) => {
                            const idade = membro.data_nascimento 
                              ? new Date().getFullYear() - new Date(membro.data_nascimento).getFullYear()
                              : null

                            return (
                              <div
                                key={membro.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                                    membro.tipo === 'juventude' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {membro.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {membro.nome}
                                      {membro.tipo === 'juventude' && (
                                        <span className="ml-1 text-xs text-blue-600">👶</span>
                                      )}
                                    </p>
                                    <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                      {idade && (
                                        <span>🎂 {idade} anos</span>
                                      )}
                                      {membro.cargo && (
                                        <span>• {membro.cargo}</span>
                                      )}
                                      {membro.tipo === 'juventude' && membro.responsaveis && (
                                        <span className="text-xs text-gray-400">
                                          {membro.responsaveis.pai && `Pai: ${membro.responsaveis.pai}`}
                                          {membro.responsaveis.pai && membro.responsaveis.mae && ' • '}
                                          {membro.responsaveis.mae && `Mãe: ${membro.responsaveis.mae}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddMembro(membro.id, membro.tipo)}
                                  className="text-primary-600 hover:text-primary-900 text-sm ml-2 flex-shrink-0"
                                >
                                  Adicionar
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeMembrosModal}
                    className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      </div>
    </Layout>
  )
}

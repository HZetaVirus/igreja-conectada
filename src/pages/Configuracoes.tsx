import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import CargoModal from '../components/CargoModal'
import CongregacaoModal from '../components/CongregacaoModal'
import UsuarioModal from '../components/UsuarioModal'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  getCargos,
  createCargo,
  updateCargo,
  deleteCargo,
} from '../services/cargosService'
import {
  getCongregacoes,
  createCongregacao,
  updateCongregacao,
  deleteCongregacao,
} from '../services/congregacoesService'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../services/usuariosService'

type Tab = 'cargos' | 'congregacoes' | 'usuarios'

export default function Configuracoes() {
  const { isSuperAdmin } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('cargos')
  const [loading, setLoading] = useState(true)

  // Cargos
  const [cargos, setCargos] = useState<any[]>([])
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false)
  const [selectedCargo, setSelectedCargo] = useState<any | null>(null)

  // Congregações
  const [congregacoes, setCongregacoes] = useState<any[]>([])
  const [isCongregacaoModalOpen, setIsCongregacaoModalOpen] = useState(false)
  const [selectedCongregacao, setSelectedCongregacao] = useState<any | null>(null)

  // Usuários
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<any | null>(null)

  // Confirm Dialog
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
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    if (activeTab === 'cargos') {
      await loadCargos()
    } else if (activeTab === 'congregacoes') {
      await loadCongregacoes()
    } else if (activeTab === 'usuarios') {
      await loadUsuarios()
    }
    setLoading(false)
  }

  async function loadCargos() {
    const result = await getCargos()
    if (result.success && result.data) {
      setCargos(result.data)
    }
  }

  async function loadCongregacoes() {
    const result = await getCongregacoes()
    if (result.success && result.data) {
      setCongregacoes(result.data)
    }
  }

  async function loadUsuarios() {
    const result = await getUsuarios()
    if (result.success && result.data) {
      setUsuarios(result.data)
    }
  }

  // Cargos
  function openCargoModal(cargo?: any) {
    setSelectedCargo(cargo || null)
    setIsCargoModalOpen(true)
  }

  function closeCargoModal() {
    setIsCargoModalOpen(false)
    setSelectedCargo(null)
  }

  async function handleSaveCargo(data: any) {
    const result = selectedCargo
      ? await updateCargo(selectedCargo.id, data)
      : await createCargo(data)

    if (result.success) {
      toast.success(selectedCargo ? 'Cargo atualizado!' : 'Cargo criado!')
      closeCargoModal()
      loadCargos()
    } else {
      toast.error(result.error || 'Erro ao salvar cargo')
    }
  }

  function handleDeleteCargo(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Cargo',
      message: 'Tem certeza que deseja excluir este cargo?',
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteCargo(id)
        if (result.success) {
          toast.success('Cargo excluído!')
          loadCargos()
        } else {
          toast.error(result.error || 'Erro ao excluir cargo')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  // Congregações
  function openCongregacaoModal(congregacao?: any) {
    setSelectedCongregacao(congregacao || null)
    setIsCongregacaoModalOpen(true)
  }

  function closeCongregacaoModal() {
    setIsCongregacaoModalOpen(false)
    setSelectedCongregacao(null)
  }

  async function handleSaveCongregacao(data: any) {
    const result = selectedCongregacao
      ? await updateCongregacao(selectedCongregacao.id, data)
      : await createCongregacao(data)

    if (result.success) {
      toast.success(selectedCongregacao ? 'Congregação atualizada!' : 'Congregação criada!')
      closeCongregacaoModal()
      loadCongregacoes()
    } else {
      toast.error(result.error || 'Erro ao salvar congregação')
    }
  }

  function handleDeleteCongregacao(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Congregação',
      message: 'Tem certeza que deseja excluir esta congregação? Todos os dados relacionados serão perdidos!',
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteCongregacao(id)
        if (result.success) {
          toast.success('Congregação excluída!')
          loadCongregacoes()
        } else {
          toast.error(result.error || 'Erro ao excluir congregação')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  // Usuários
  function openUsuarioModal(usuario?: any) {
    setSelectedUsuario(usuario || null)
    setIsUsuarioModalOpen(true)
  }

  function closeUsuarioModal() {
    setIsUsuarioModalOpen(false)
    setSelectedUsuario(null)
  }

  async function handleSaveUsuario(data: any) {
    const result = selectedUsuario
      ? await updateUsuario(selectedUsuario.id, data)
      : await createUsuario(data)

    if (result.success) {
      toast.success(selectedUsuario ? 'Usuário atualizado!' : 'Usuário criado!')
      closeUsuarioModal()
      loadUsuarios()
    } else {
      toast.error(result.error || 'Erro ao salvar usuário')
    }
  }

  function handleDeleteUsuario(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Usuário',
      message: 'Tem certeza que deseja excluir este usuário?',
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteUsuario(id)
        if (result.success) {
          toast.success('Usuário excluído!')
          loadUsuarios()
        } else {
          toast.error(result.error || 'Erro ao excluir usuário')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Apenas super administradores podem acessar as configurações.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">Gerencie cargos, congregações e usuários do sistema</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cargos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cargos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cargos
            </button>
            <button
              onClick={() => setActiveTab('congregacoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'congregacoes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Congregações
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuários
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Tab Cargos */}
            {activeTab === 'cargos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Cargos Eclesiásticos</h2>
                  <button
                    onClick={() => openCargoModal()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    + Novo Cargo
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cargos.map((cargo) => (
                        <tr key={cargo.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {cargo.nome}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {cargo.descricao || '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => openCargoModal(cargo)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCargo(cargo.id)}
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
              </div>
            )}

            {/* Tab Congregações */}
            {activeTab === 'congregacoes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Congregações</h2>
                  <button
                    onClick={() => openCongregacaoModal()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    + Nova Congregação
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {congregacoes.map((cong) => (
                    <div key={cong.id} className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{cong.nome}</h3>
                      {cong.endereco && (
                        <p className="text-sm text-gray-600 mb-2">📍 {cong.endereco}</p>
                      )}
                      {cong.telefone && (
                        <p className="text-sm text-gray-600 mb-2">📞 {cong.telefone}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => openCongregacaoModal(cong)}
                          className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCongregacao(cong.id)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Usuários */}
            {activeTab === 'usuarios' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Usuários do Sistema</h2>
                  <button
                    onClick={() => openUsuarioModal()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    + Novo Usuário
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nível de Acesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Congregação
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarios.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                            {user.nivel_acesso}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.congregacao?.nome || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => openUsuarioModal(user)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteUsuario(user.id)}
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
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <CargoModal
          isOpen={isCargoModalOpen}
          onClose={closeCargoModal}
          onSave={handleSaveCargo}
          cargo={selectedCargo}
        />

        <CongregacaoModal
          isOpen={isCongregacaoModalOpen}
          onClose={closeCongregacaoModal}
          onSave={handleSaveCongregacao}
          congregacao={selectedCongregacao}
        />

        <UsuarioModal
          isOpen={isUsuarioModalOpen}
          onClose={closeUsuarioModal}
          onSave={handleSaveUsuario}
          usuario={selectedUsuario}
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </Layout>
  )
}

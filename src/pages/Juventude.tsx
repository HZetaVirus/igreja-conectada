import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getJuventude, deleteJuventude, Juventude as JuventudeType } from '../services/familiasService'
import { format } from 'date-fns'

export default function Juventude() {
  const { usuario, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [juventude, setJuventude] = useState<JuventudeType[]>([])
  const [loading, setLoading] = useState(true)
  const [filterIdade, setFilterIdade] = useState('todos')

  useEffect(() => {
    loadJuventude()
  }, [usuario])

  async function loadJuventude() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined
    const result = await getJuventude(congregacaoId)
    
    if (result.success && result.data) {
      setJuventude(result.data)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        const result = await deleteJuventude(id)
        if (result.success) {
          toast.success('Registro excluído com sucesso!')
          loadJuventude()
        } else {
          toast.error(result.error || 'Erro ao excluir registro')
        }
      } catch (error) {
        toast.error('Erro inesperado ao excluir registro')
      }
    }
  }

  function calcularIdade(dataNascimento: string): number {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  function getFaixaEtaria(idade: number): string {
    if (idade <= 12) return 'crianca'
    if (idade <= 17) return 'adolescente'
    return 'jovem'
  }

  // Filtrar por faixa etária
  const juventudeFiltered = juventude.filter((j) => {
    if (filterIdade === 'todos') return true
    const idade = calcularIdade(j.data_nascimento)
    return getFaixaEtaria(idade) === filterIdade
  })

  // Estatísticas
  const criancas = juventude.filter(j => calcularIdade(j.data_nascimento) <= 12).length
  const adolescentes = juventude.filter(j => {
    const idade = calcularIdade(j.data_nascimento)
    return idade >= 13 && idade <= 17
  }).length
  const jovens = juventude.filter(j => calcularIdade(j.data_nascimento) >= 18).length

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Juventude</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              {juventude.length} {juventude.length === 1 ? 'criança/jovem cadastrado' : 'crianças/jovens cadastrados'}
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Crianças (0-12)</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{criancas}</p>
              </div>
              <div className="text-2xl sm:text-4xl">👶</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Adolescentes (13-17)</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">{adolescentes}</p>
              </div>
              <div className="text-2xl sm:text-4xl">🧒</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Jovens (18+)</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{jovens}</p>
              </div>
              <div className="text-2xl sm:text-4xl">👨</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Faixa Etária
              </label>
              <select
                value={filterIdade}
                onChange={(e) => setFilterIdade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todas as idades</option>
                <option value="crianca">Crianças (0-12 anos)</option>
                <option value="adolescente">Adolescentes (13-17 anos)</option>
                <option value="jovem">Jovens (18+ anos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Carregando...</p>
          </div>
        ) : juventudeFiltered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">
              {filterIdade === 'todos' 
                ? 'Nenhum registro encontrado'
                : 'Nenhum registro encontrado para esta faixa etária'}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Os filhos são cadastrados automaticamente ao criar um membro
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Data Nascimento
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Idade
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                    Responsáveis
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {juventudeFiltered.map((j) => {
                  const idade = calcularIdade(j.data_nascimento)
                  const faixaEtaria = getFaixaEtaria(idade)
                  
                  return (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                            {j.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{j.nome}</p>
                            <p className="text-xs text-gray-500">
                              {faixaEtaria === 'crianca' && '👶 Criança'}
                              {faixaEtaria === 'adolescente' && '🧒 Adolescente'}
                              {faixaEtaria === 'jovem' && '👨 Jovem'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                        {format(new Date(j.data_nascimento), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="text-sm font-bold text-gray-900">{idade} anos</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                        <div className="space-y-1">
                          {j.pai && (
                            <p className="text-xs">
                              <span className="text-gray-500">Pai:</span> {j.pai.nome}
                            </p>
                          )}
                          {j.mae && (
                            <p className="text-xs">
                              <span className="text-gray-500">Mãe:</span> {j.mae.nome}
                            </p>
                          )}
                          {!j.pai && !j.mae && (
                            <p className="text-xs text-gray-400">Sem responsáveis</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  getDashboardStats,
  getDizimosPorMes,
  getCrescimentoMembros,
  getStatusConvertidos,
  DashboardStats,
  DizimosPorMes,
  CrescimentoMembros,
} from '../services/dashboardService'
import { exportarRelatorioConsolidadoPDF } from '../services/relatoriosService'

export default function Dashboard() {
  const { usuario, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembros: 0,
    novosConvertidos: 0,
    cargosAtivos: 0,
    totalDizimos: 0,
  })
  const [dizimosPorMes, setDizimosPorMes] = useState<DizimosPorMes[]>([])
  const [crescimentoMembros, setCrescimentoMembros] = useState<CrescimentoMembros[]>([])
  const [statusConvertidos, setStatusConvertidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [usuario])

  async function loadDashboardData() {
    setLoading(true)
    const congregacaoId = isSuperAdmin ? undefined : usuario?.congregacaoId || undefined

    // Carregar estatísticas
    const statsResult = await getDashboardStats(congregacaoId)
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }

    // Carregar dízimos por mês
    const dizimosResult = await getDizimosPorMes(congregacaoId, 6)
    if (dizimosResult.success && dizimosResult.data) {
      setDizimosPorMes(dizimosResult.data)
    }

    // Carregar crescimento de membros
    const crescimentoResult = await getCrescimentoMembros(congregacaoId, 6)
    if (crescimentoResult.success && crescimentoResult.data) {
      setCrescimentoMembros(crescimentoResult.data)
    }

    // Carregar status de convertidos
    const statusResult = await getStatusConvertidos(congregacaoId)
    if (statusResult.success && statusResult.data) {
      setStatusConvertidos(statusResult.data)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo, {usuario?.email}
              {!isSuperAdmin && usuario?.congregacao && (
                <span className="ml-2 text-primary-600">
                  • {usuario.congregacao.nome}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              exportarRelatorioConsolidadoPDF(
                stats,
                usuario?.congregacao?.nome || 'Todas',
                'Mês Atual'
              )
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
          >
            <span>📑</span>
            Relatório Consolidado
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Membros</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalMembros}
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Novos Convertidos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.novosConvertidos}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Este mês</p>
                  </div>
                  <div className="text-4xl">✨</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cargos Ativos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.cargosAtivos}
                    </p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Dízimos do Mês</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      R$ {stats.totalDizimos.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Dízimos e Ofertas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Dízimos e Ofertas (Últimos 6 meses)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dizimosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="dizimos" fill="#10b981" name="Dízimos" />
                    <Bar dataKey="ofertas" fill="#3b82f6" name="Ofertas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Crescimento de Membros */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Crescimento de Membros
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={crescimentoMembros}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="novos"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      name="Novos Membros"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Total Acumulado"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráficos Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Status de Convertidos */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Status do Discipulado
                </h2>
                {statusConvertidos.some(s => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusConvertidos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusConvertidos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Nenhum convertido cadastrado
                  </div>
                )}
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Resumo Financeiro (6 meses)
                </h2>
                <div className="space-y-4">
                  {dizimosPorMes.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Total de Dízimos</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              dizimosPorMes.reduce((acc, m) => acc + m.dizimos, 0)
                            )}
                          </p>
                        </div>
                        <div className="text-3xl">💰</div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Total de Ofertas</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(
                              dizimosPorMes.reduce((acc, m) => acc + m.ofertas, 0)
                            )}
                          </p>
                        </div>
                        <div className="text-3xl">🎁</div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Total Geral</p>
                          <p className="text-2xl font-bold text-primary-600">
                            {formatCurrency(
                              dizimosPorMes.reduce((acc, m) => acc + m.total, 0)
                            )}
                          </p>
                        </div>
                        <div className="text-3xl">📊</div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Média Mensal</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            dizimosPorMes.reduce((acc, m) => acc + m.total, 0) / dizimosPorMes.length
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Nenhuma contribuição registrada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

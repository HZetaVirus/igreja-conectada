import { useState, useEffect } from 'react'
import { DadosFamiliares, DadosFilho } from '../services/familiasService'
import { getMembros } from '../services/membrosService'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (dados: DadosFamiliares) => void
  congregacaoId?: string
  membroNome: string
}

export default function InformacoesFamiliaresModal({
  isOpen,
  onClose,
  onSave,
  congregacaoId,
  membroNome,
}: Props) {
  const [estadoCivil, setEstadoCivil] = useState<'solteiro' | 'casado' | 'viuvo' | 'divorciado'>('solteiro')
  const [conjugeId, setConjugeId] = useState('')
  const [temFilhos, setTemFilhos] = useState(false)
  const [quantidadeFilhos, setQuantidadeFilhos] = useState(0)
  const [filhos, setFilhos] = useState<DadosFilho[]>([])
  const [membrosDisponiveis, setMembrosDisponiveis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMembros()
    }
  }, [isOpen])

  useEffect(() => {
    if (quantidadeFilhos > filhos.length) {
      const novosFilhos = [...filhos]
      for (let i = filhos.length; i < quantidadeFilhos; i++) {
        novosFilhos.push({ nome: '', dataNascimento: '' })
      }
      setFilhos(novosFilhos)
    } else if (quantidadeFilhos < filhos.length) {
      setFilhos(filhos.slice(0, quantidadeFilhos))
    }
  }, [quantidadeFilhos])

  async function loadMembros() {
    const result = await getMembros(congregacaoId)
    if (result.success && result.data) {
      setMembrosDisponiveis(result.data.filter(m => m.status_espiritual === 'ativo'))
    }
  }

  function handleFilhoChange(index: number, field: 'nome' | 'dataNascimento', value: string) {
    const novosFilhos = [...filhos]
    novosFilhos[index] = { ...novosFilhos[index], [field]: value }
    setFilhos(novosFilhos)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validações
    if (estadoCivil === 'casado' && !conjugeId) {
      alert('Por favor, selecione o cônjuge')
      return
    }

    if (temFilhos && quantidadeFilhos === 0) {
      alert('Por favor, informe a quantidade de filhos')
      return
    }

    if (temFilhos && quantidadeFilhos > 0) {
      const filhosValidos = filhos.filter(f => f.nome && f.dataNascimento)
      if (filhosValidos.length !== quantidadeFilhos) {
        alert('Por favor, preencha todos os dados dos filhos')
        return
      }
    }

    const dados: DadosFamiliares = {
      estadoCivil,
      conjugeId: estadoCivil === 'casado' ? conjugeId : undefined,
      temFilhos,
      quantidadeFilhos: temFilhos ? quantidadeFilhos : 0,
      filhos: temFilhos ? filhos : [],
    }

    onSave(dados)
  }

  function handlePular() {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Informações Familiares</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete os dados de <span className="font-medium">{membroNome}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Estado Civil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Civil *
                </label>
                <select
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
              </div>

              {/* Cônjuge (se casado) */}
              {estadoCivil === 'casado' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cônjuge *
                  </label>
                  <select
                    value={conjugeId}
                    onChange={(e) => setConjugeId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Selecione o cônjuge</option>
                    {membrosDisponiveis.map((membro) => (
                      <option key={membro.id} value={membro.id}>
                        {membro.nome}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Se o cônjuge não estiver na lista, cadastre-o primeiro como membro
                  </p>
                </div>
              )}

              {/* Tem Filhos */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={temFilhos}
                    onChange={(e) => {
                      setTemFilhos(e.target.checked)
                      if (!e.target.checked) {
                        setQuantidadeFilhos(0)
                        setFilhos([])
                      }
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tem filhos?</span>
                </label>
              </div>

              {/* Quantidade de Filhos */}
              {temFilhos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Filhos *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantidadeFilhos}
                    onChange={(e) => setQuantidadeFilhos(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              )}

              {/* Dados dos Filhos */}
              {temFilhos && quantidadeFilhos > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Dados dos Filhos
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filhos.map((filho, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Filho(a) {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              value={filho.nome}
                              onChange={(e) =>
                                handleFilhoChange(index, 'nome', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                              placeholder="Nome do filho(a)"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Data de Nascimento *
                            </label>
                            <input
                              type="date"
                              value={filho.dataNascimento}
                              onChange={(e) =>
                                handleFilhoChange(index, 'dataNascimento', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Os filhos serão automaticamente cadastrados na tabela de Juventude
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between rounded-b-lg">
            <button
              type="button"
              onClick={handlePular}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition text-sm"
            >
              Pular esta etapa
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

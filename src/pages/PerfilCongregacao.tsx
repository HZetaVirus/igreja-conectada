import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../services/supabaseClient'

export default function PerfilCongregacao() {
  const { usuario } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    responsavel: '',
    telefone: '',
    email: '',
    descricao: '',
    data_inauguracao: '',
    fundadores: '',
    cofundadores: '',
    foto: '',
  })

  useEffect(() => {
    loadCongregacao()
  }, [usuario])

  async function loadCongregacao() {
    if (!usuario?.congregacaoId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('congregacoes')
        .select('*')
        .eq('id', usuario.congregacaoId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          nome: data.nome || '',
          endereco: data.endereco || '',
          responsavel: data.responsavel || '',
          telefone: data.telefone || '',
          email: data.email || '',
          descricao: data.descricao || '',
          data_inauguracao: data.data_inauguracao || '',
          fundadores: data.fundadores || '',
          cofundadores: data.cofundadores || '',
          foto: data.foto || '',
        })
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados da congregação')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !usuario?.congregacaoId) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setUploading(true)
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${usuario.congregacaoId}-${Date.now()}.${fileExt}`
      const filePath = `congregacoes/${fileName}`

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath)

      // Atualizar formData com a nova URL
      setFormData({ ...formData, foto: publicUrl })
      toast.success('Foto enviada com sucesso!')
    } catch (error: any) {
      // Error logged
      toast.error('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario?.congregacaoId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('congregacoes')
        .update(formData)
        .eq('id', usuario.congregacaoId)

      if (error) throw error

      toast.success('Perfil da congregação atualizado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil da congregação')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Perfil da Congregação</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto da Congregação */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Foto da Congregação</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {formData.foto ? (
                <img
                  src={formData.foto}
                  alt="Congregação"
                  className="w-32 h-32 rounded-lg object-cover shadow-md"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">⛪</span>
                </div>
              )}
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enviar Foto
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                          <span className="text-sm text-gray-600">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">📷</span>
                          <span className="text-sm text-gray-600">
                            Escolher arquivo
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.foto && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, foto: '' })}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Congregação *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Inauguração
                </label>
                <input
                  type="date"
                  value={formData.data_inauguracao}
                  onChange={(e) => setFormData({ ...formData, data_inauguracao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="contato@congregacao.com"
                />
              </div>
            </div>
          </div>

          {/* Fundadores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fundadores</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fundadores
                </label>
                <textarea
                  value={formData.fundadores}
                  onChange={(e) => setFormData({ ...formData, fundadores: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={2}
                  placeholder="Nomes dos fundadores separados por vírgula"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cofundadores
                </label>
                <textarea
                  value={formData.cofundadores}
                  onChange={(e) => setFormData({ ...formData, cofundadores: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={2}
                  placeholder="Nomes dos cofundadores separados por vírgula"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre a Congregação</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                rows={4}
                placeholder="Conte um pouco sobre a história e missão da congregação..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={loadCongregacao}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

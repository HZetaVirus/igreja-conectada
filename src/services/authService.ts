import { supabase } from './supabaseClient'

export interface LoginResponse {
  success: boolean
  usuario?: {
    id: string
    email: string
    nivelAcesso: string
    congregacaoId?: string | null
    congregacao?: any
  }
  token?: string
  error?: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    // 1. FAZER LOGIN NO SUPABASE AUTH
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        error: 'Credenciais inválidas',
      }
    }

    // 2. BUSCAR DADOS DO USUÁRIO NA TABELA USUARIOS
    const { data: usuarios, error: dbError } = await supabase
      .from('usuarios')
      .select(`
        *,
        congregacao:congregacoes(*)
      `)
      .eq('id', authData.user.id)
      .eq('ativo', true)
      .single()

    if (dbError || !usuarios) {
      // Se não encontrar na tabela usuarios, fazer logout
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Usuário não encontrado no sistema',
      }
    }

    // 3. RETORNAR DADOS DO USUÁRIO
    return {
      success: true,
      usuario: {
        id: usuarios.id,
        email: usuarios.email,
        nivelAcesso: usuarios.nivel_acesso,
        congregacaoId: usuarios.congregacao_id,
        congregacao: usuarios.congregacao,
      },
      token: authData.session?.access_token || '',
    }
  } catch (error) {
    // Error logged
    return {
      success: false,
      error: 'Erro ao fazer login',
    }
  }
}

export function verifyToken(token: string): any {
  try {
    const decoded = JSON.parse(atob(token))
    // Verificar se o token não expirou (7 dias)
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - decoded.timestamp > sevenDays) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function getCurrentUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        congregacao:congregacoes(*)
      `)
      .eq('id', userId)
      .eq('ativo', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      nivelAcesso: data.nivel_acesso,
      congregacaoId: data.congregacao_id,
      congregacao: data.congregacao,
    }
  } catch (error) {
    // Error logged
    return null
  }
}

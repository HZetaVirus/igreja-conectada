import { supabase, Congregacao } from './supabaseClient'

export interface CreateCongregacaoData {
  nome: string
  endereco?: string
  responsavel?: string
}

export async function getCongregacoes() {
  try {
    const { data, error } = await supabase
      .from('congregacoes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createCongregacao(congregacao: CreateCongregacaoData) {
  try {
    const { data, error } = await supabase
      .from('congregacoes')
      .insert([congregacao])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function updateCongregacao(id: string, data: Partial<CreateCongregacaoData>) {
  try {
    const { data: result, error } = await supabase
      .from('congregacoes')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function deleteCongregacao(id: string) {
  try {
    // Verificar se há usuários vinculados
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .eq('congregacao_id', id)

    if (usuariosError) throw usuariosError

    if (usuarios && usuarios.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir esta congregação pois existem usuários vinculados a ela. Remova ou transfira os usuários primeiro.'
      }
    }

    // Verificar se há membros vinculados
    const { data: membros, error: membrosError } = await supabase
      .from('membros')
      .select('id', { count: 'exact', head: true })
      .eq('congregacao_id', id)

    if (membrosError) throw membrosError

    if (membros && membros.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir esta congregação pois existem membros vinculados a ela. Remova ou transfira os membros primeiro.'
      }
    }

    // Verificar se há dízimos vinculados
    const { data: dizimos, error: dizimosError } = await supabase
      .from('dizimos')
      .select('id', { count: 'exact', head: true })
      .eq('congregacao_id', id)

    if (dizimosError) throw dizimosError

    if (dizimos && dizimos.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir esta congregação pois existem registros financeiros vinculados a ela.'
      }
    }

    // Verificar se há convertidos vinculados
    const { data: convertidos, error: convertidosError } = await supabase
      .from('convertidos')
      .select('id', { count: 'exact', head: true })
      .eq('congregacao_id', id)

    if (convertidosError) throw convertidosError

    if (convertidos && convertidos.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir esta congregação pois existem convertidos vinculados a ela.'
      }
    }

    // Se passou por todas as verificações, pode excluir
    const { error } = await supabase
      .from('congregacoes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

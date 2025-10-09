import { supabase } from './supabaseClient'

export interface Cargo {
  id: string
  nome: string
  descricao: string
  congregacao_id: string | null
  created_at: string
  updated_at: string
}

export async function getCargos(congregacaoId?: string) {
  try {
    let query = supabase
      .from('cargos')
      .select('*')
      .order('nome', { ascending: true })

    // Buscar cargos globais (congregacao_id null) ou da congregação específica
    if (congregacaoId) {
      query = query.or(`congregacao_id.is.null,congregacao_id.eq.${congregacaoId}`)
    } else {
      query = query.is('congregacao_id', null)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar cargos:', error)
    return { success: false, error: error.message }
  }
}

export async function getCargoById(id: string) {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar cargo:', error)
    return { success: false, error: error.message }
  }
}

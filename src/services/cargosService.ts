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

export interface CreateCargoData {
  nome: string
  descricao?: string
  congregacao_id?: string | null
}

export async function createCargo(cargo: CreateCargoData) {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .insert([cargo])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao criar cargo:', error)
    return { success: false, error: error.message }
  }
}

export interface UpdateCargoData extends Partial<CreateCargoData> {
  id: string
}

export async function updateCargo(cargo: UpdateCargoData) {
  try {
    const { id, ...updateData } = cargo
    
    const { data, error } = await supabase
      .from('cargos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao atualizar cargo:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteCargo(id: string) {
  try {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar cargo:', error)
    return { success: false, error: error.message }
  }
}

import { supabase } from './supabaseClient'

export interface CreateMembroData {
  nome: string
  data_nascimento: string
  cargo?: string
  status_espiritual: string
  congregacao_id: string
  foto?: string
  telefone?: string
  email?: string
  endereco?: string
  data_batismo?: string | null
  carta_bencao?: string | null
  origem_membro?: string | null
  congregacao_origem?: string | null
}

export interface UpdateMembroData extends Partial<CreateMembroData> {
  id: string
}

export async function getMembros(congregacaoId?: string) {
  try {
    let query = supabase
      .from('membros')
      .select('*')
      .order('nome', { ascending: true })

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getMembroById(id: string) {
  try {
    const { data, error } = await supabase
      .from('membros')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createMembro(membro: CreateMembroData) {
  try {
    // Limpar campos vazios (converter strings vazias em null)
    const cleanedData: any = {}
    Object.keys(membro).forEach(key => {
      const value = (membro as any)[key]
      if (value === '' || value === undefined) {
        cleanedData[key] = null
      } else {
        cleanedData[key] = value
      }
    })
    
    const { data, error } = await supabase
      .from('membros')
      .insert([cleanedData])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function updateMembro(membro: UpdateMembroData) {
  try {
    const { id, ...updateData } = membro
    
    // Limpar campos vazios (converter strings vazias em null)
    const cleanedData: any = {}
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key]
      if (value === '' || value === undefined) {
        cleanedData[key] = null
      } else {
        cleanedData[key] = value
      }
    })
    
    const { data, error } = await supabase
      .from('membros')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function deleteMembro(id: string) {
  try {
    const { error } = await supabase
      .from('membros')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function searchMembros(searchTerm: string, congregacaoId?: string) {
  try {
    let query = supabase
      .from('membros')
      .select('*')
      .ilike('nome', `%${searchTerm}%`)
      .order('nome', { ascending: true })

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

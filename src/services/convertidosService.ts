import { supabase, Convertido } from './supabaseClient'

export interface CreateConvertidoData {
  nome: string
  data_conversao: string
  discipulador_id?: string
  congregacao_id: string
  status_etapa: 'iniciado' | 'em_andamento' | 'concluido'
  telefone?: string
  observacoes?: string
}

export async function getConvertidos(congregacaoId?: string) {
  try {
    let query = supabase
      .from('convertidos')
      .select(`
        *,
        discipulador:membros(nome, email)
      `)
      .order('data_conversao', { ascending: false })

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

export async function createConvertido(convertido: CreateConvertidoData) {
  try {
    // Limpar campos vazios (converter strings vazias em null)
    const cleanedData: any = {}
    Object.keys(convertido).forEach(key => {
      const value = (convertido as any)[key]
      if (value === '' || value === undefined) {
        cleanedData[key] = null
      } else {
        cleanedData[key] = value
      }
    })
    
    const { data, error } = await supabase
      .from('convertidos')
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

export async function updateConvertido(id: string, updateData: Partial<CreateConvertidoData>) {
  try {
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
    
    const { data: result, error } = await supabase
      .from('convertidos')
      .update(cleanedData)
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

export async function deleteConvertido(id: string) {
  try {
    const { error } = await supabase
      .from('convertidos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

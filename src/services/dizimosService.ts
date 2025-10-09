import { supabase } from './supabaseClient'

export interface CreateDizimoData {
  membro_id: string
  valor: number
  data: string
  tipo: 'dizimo' | 'oferta'
  congregacao_id: string
  observacao?: string
}

export async function getDizimos(congregacaoId?: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('dizimos')
      .select(`
        *,
        membro:membros(nome, email)
      `)
      .order('data', { ascending: false })

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }

    if (startDate) {
      query = query.gte('data', startDate)
    }

    if (endDate) {
      query = query.lte('data', endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createDizimo(dizimo: CreateDizimoData) {
  try {
    const { data, error } = await supabase
      .from('dizimos')
      .insert([dizimo])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function deleteDizimo(id: string) {
  try {
    const { error } = await supabase
      .from('dizimos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getTotalizadores(congregacaoId?: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('dizimos')
      .select('valor, tipo')

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }

    if (startDate) {
      query = query.gte('data', startDate)
    }

    if (endDate) {
      query = query.lte('data', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const totais = data?.reduce(
      (acc, item) => {
        if (item.tipo === 'dizimo') {
          acc.dizimos += Number(item.valor)
        } else {
          acc.ofertas += Number(item.valor)
        }
        acc.total += Number(item.valor)
        return acc
      },
      { dizimos: 0, ofertas: 0, total: 0 }
    )

    return { success: true, data: totais }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

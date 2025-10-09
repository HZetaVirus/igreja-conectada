import { supabase } from './supabaseClient'

export async function getCargos() {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createCargo(cargo: { nome: string; descricao?: string }) {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .insert([cargo])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function updateCargo(id: string, cargo: { nome: string; descricao?: string }) {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .update(cargo)
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

export async function deleteCargo(id: string) {
  try {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

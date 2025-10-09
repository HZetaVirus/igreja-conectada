import { supabase } from './supabaseClient'

export async function getUsuarios() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        congregacao:congregacoes(id, nome)
      `)
      .order('email', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createUsuario(usuario: {
  email: string
  senha: string
  nivel_acesso: string
  congregacao_id: string
  ativo: boolean
}) {
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: usuario.email,
      password: usuario.senha,
    })

    if (authError) throw authError

    // O trigger no banco vai criar automaticamente o registro na tabela usuarios
    // Aguardar um pouco para o trigger executar
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Atualizar os dados do usuário
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        nivel_acesso: usuario.nivel_acesso,
        congregacao_id: usuario.congregacao_id,
        ativo: usuario.ativo,
      })
      .eq('id', authData.user?.id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function updateUsuario(id: string, usuario: {
  nivel_acesso?: string
  congregacao_id?: string
  ativo?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
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

export async function deleteUsuario(id: string) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

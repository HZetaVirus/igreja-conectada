import { supabase } from './supabaseClient'

export interface DadosFamiliares {
  estadoCivil: 'solteiro' | 'casado' | 'viuvo' | 'divorciado'
  conjugeId?: string
  temFilhos: boolean
  quantidadeFilhos: number
  filhos?: DadosFilho[]
}

export interface DadosFilho {
  nome: string
  dataNascimento: string
}

export interface Juventude {
  id: string
  nome: string
  data_nascimento: string
  congregacao_id: string
  pai_id?: string
  mae_id?: string
  pai?: { nome: string }
  mae?: { nome: string }
  observacoes?: string
  ativo: boolean
  created_at: string
}

// ========================================
// ATUALIZAR INFORMAÇÕES FAMILIARES DO MEMBRO
// ========================================

export async function atualizarInformacoesFamiliares(
  membroId: string,
  dados: DadosFamiliares
) {
  try {
    // Atualizar dados do membro
    const { error: membroError } = await supabase
      .from('membros')
      .update({
        estado_civil: dados.estadoCivil,
        conjuge_id: dados.conjugeId || null,
        tem_filhos: dados.temFilhos,
        quantidade_filhos: dados.quantidadeFilhos,
      })
      .eq('id', membroId)

    if (membroError) throw membroError

    // Se tiver filhos, cadastrar na tabela juventude
    if (dados.temFilhos && dados.filhos && dados.filhos.length > 0) {
      // Buscar congregação do membro
      const { data: membro } = await supabase
        .from('membros')
        .select('congregacao_id')
        .eq('id', membroId)
        .single()

      if (!membro) throw new Error('Membro não encontrado')

      // Inserir filhos
      const filhosData = dados.filhos.map((filho) => ({
        nome: filho.nome,
        data_nascimento: filho.dataNascimento,
        congregacao_id: membro.congregacao_id,
        pai_id: membroId, // Por padrão, assume que é o pai
        ativo: true,
      }))

      const { error: filhosError } = await supabase
        .from('juventude')
        .insert(filhosData)

      if (filhosError) throw filhosError
    }

    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// ========================================
// BUSCAR JUVENTUDE
// ========================================

export async function getJuventude(congregacaoId?: string) {
  try {
    let query = supabase
      .from('juventude')
      .select(`
        *,
        pai:membros!pai_id(nome),
        mae:membros!mae_id(nome)
      `)
      .eq('ativo', true)
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

// ========================================
// CRIAR JUVENTUDE
// ========================================

export async function createJuventude(dados: {
  nome: string
  dataNascimento: string
  congregacaoId: string
  paiId?: string
  maeId?: string
  observacoes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('juventude')
      .insert({
        nome: dados.nome,
        data_nascimento: dados.dataNascimento,
        congregacao_id: dados.congregacaoId,
        pai_id: dados.paiId || null,
        mae_id: dados.maeId || null,
        observacoes: dados.observacoes || null,
        ativo: true,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// ========================================
// ATUALIZAR JUVENTUDE
// ========================================

export async function updateJuventude(
  id: string,
  dados: {
    nome?: string
    dataNascimento?: string
    paiId?: string
    maeId?: string
    observacoes?: string
    ativo?: boolean
  }
) {
  try {
    const updateData: any = {}
    if (dados.nome !== undefined) updateData.nome = dados.nome
    if (dados.dataNascimento !== undefined) updateData.data_nascimento = dados.dataNascimento
    if (dados.paiId !== undefined) updateData.pai_id = dados.paiId || null
    if (dados.maeId !== undefined) updateData.mae_id = dados.maeId || null
    if (dados.observacoes !== undefined) updateData.observacoes = dados.observacoes
    if (dados.ativo !== undefined) updateData.ativo = dados.ativo

    const { error } = await supabase
      .from('juventude')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// ========================================
// DELETAR JUVENTUDE
// ========================================

export async function deleteJuventude(id: string) {
  try {
    const { error } = await supabase
      .from('juventude')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// ========================================
// BUSCAR FILHOS DE UM MEMBRO
// ========================================

export async function getFilhosMembro(membroId: string) {
  try {
    const { data, error } = await supabase
      .from('juventude')
      .select('*')
      .or(`pai_id.eq.${membroId},mae_id.eq.${membroId}`)
      .eq('ativo', true)
      .order('data_nascimento', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// ========================================
// BUSCAR MEMBROS CASADOS (PARA VINCULAR CÔNJUGE)
// ========================================

export async function getMembrosCasados(congregacaoId: string) {
  try {
    const { data, error } = await supabase
      .from('membros')
      .select('id, nome, estado_civil')
      .eq('congregacao_id', congregacaoId)
      .eq('estado_civil', 'casado')
      .eq('status_espiritual', 'ativo')
      .order('nome', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

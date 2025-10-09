import { supabase } from './supabaseClient'

export interface Departamento {
  id: string
  nome: string
  descricao?: string
  responsavel_id?: string
  congregacao_id: string
  cor: string
  ativo: boolean
  apenas_juventude?: boolean
  created_at: string
  updated_at: string
  responsavel?: {
    id: string
    nome: string
  }
  _count?: {
    membros: number
  }
}

export interface CreateDepartamentoData {
  nome: string
  descricao?: string
  responsavel_id?: string
  congregacao_id: string
  cor?: string
  ativo?: boolean
  apenas_juventude?: boolean
}

export interface MembroDepartamento {
  id: string
  membro_id: string
  departamento_id: string
  data_entrada: string
  cargo_departamento?: string
  ativo: boolean
  membro?: {
    id: string
    nome: string
    foto?: string
  }
}

export async function getDepartamentos(congregacaoId?: string) {
  try {
    let query = supabase
      .from('departamentos')
      .select(`
        *,
        responsavel:membros!responsavel_id(id, nome)
      `)
      .order('nome', { ascending: true })

    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }

    const { data, error } = await query

    if (error) throw error

    // Buscar contagem de membros para cada departamento
    if (data) {
      const departamentosComContagem = await Promise.all(
        data.map(async (dept) => {
          const { count } = await supabase
            .from('membros_departamentos')
            .select('*', { count: 'exact', head: true })
            .eq('departamento_id', dept.id)
            .eq('ativo', true)

          return {
            ...dept,
            _count: { membros: count || 0 }
          }
        })
      )

      return { success: true, data: departamentosComContagem }
    }

    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getDepartamentoById(id: string) {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select(`
        *,
        responsavel:membros!responsavel_id(id, nome)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function createDepartamento(departamento: CreateDepartamentoData) {
  try {
    // Garantir que campos UUID vazios sejam null
    const dataToInsert = {
      ...departamento,
      responsavel_id: departamento.responsavel_id || null,
    }

    const { data, error } = await supabase
      .from('departamentos')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function updateDepartamento(id: string, departamento: Partial<CreateDepartamentoData>) {
  try {
    // Garantir que campos UUID vazios sejam null
    const dataToUpdate = {
      ...departamento,
      responsavel_id: departamento.responsavel_id || null,
    }

    const { data, error } = await supabase
      .from('departamentos')
      .update(dataToUpdate)
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

export async function deleteDepartamento(id: string) {
  try {
    const { error } = await supabase
      .from('departamentos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// Membros do Departamento
export async function getMembrosDepartamento(departamentoId: string) {
  try {
    const { data, error } = await supabase
      .from('membros_departamentos')
      .select(`
        *,
        membro:membros(id, nome, foto)
      `)
      .eq('departamento_id', departamentoId)
      .eq('ativo', true)
      .order('data_entrada', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function addMembroToDepartamento(membroId: string, departamentoId: string, cargoDepartamento?: string, tipoIntegrante: 'membro' | 'juventude' = 'membro') {
  try {
    const { data, error } = await supabase
      .from('membros_departamentos')
      .insert([{
        membro_id: membroId,
        departamento_id: departamentoId,
        cargo_departamento: cargoDepartamento,
        tipo_integrante: tipoIntegrante,
        data_entrada: new Date().toISOString().split('T')[0],
        ativo: true
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function removeMembroFromDepartamento(membroId: string, departamentoId: string) {
  try {
    const { error } = await supabase
      .from('membros_departamentos')
      .delete()
      .eq('membro_id', membroId)
      .eq('departamento_id', departamentoId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// Buscar membros e juventude disponíveis para adicionar ao departamento
export async function getMembrosEJuventudeDisponiveis(congregacaoId: string, departamentoId: string) {
  try {
    // Buscar informações do departamento
    const { data: departamento } = await supabase
      .from('departamentos')
      .select('apenas_juventude')
      .eq('id', departamentoId)
      .single()

    const apenasJuventude = departamento?.apenas_juventude || false

    // Buscar IDs dos membros já no departamento
    const { data: membrosNoDept } = await supabase
      .from('membros_departamentos')
      .select('membro_id')
      .eq('departamento_id', departamentoId)
      .eq('ativo', true)

    // Filtrar apenas IDs válidos (não nulos, não vazios e formato UUID correto)
    const idsNoDept = (membrosNoDept?.map(m => m.membro_id).filter(id => {
      // Validar UUID: não nulo, string, 36 caracteres, formato correto
      if (!id || typeof id !== 'string' || id.trim() === '') return false
      // Validar formato UUID (8-4-4-4-12)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      return uuidRegex.test(id)
    }) || [])

    let membros: any[] = []
    let juventude: any[] = []

    // Se for apenas juventude, buscar SOMENTE da tabela juventude
    if (apenasJuventude) {
      // Buscar juventude ativa
      const { data: juventudeData, error: juventudeError } = await supabase
        .from('juventude')
        .select(`
          id,
          nome,
          data_nascimento,
          pai:membros!pai_id(nome),
          mae:membros!mae_id(nome)
        `)
        .eq('congregacao_id', congregacaoId)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (juventudeError) throw juventudeError
      
      // Filtrar manualmente os IDs que já estão no departamento
      juventude = (juventudeData || []).filter(j => !idsNoDept.includes(j.id))
    } else {
      // Buscar membros ativos
      const { data: membrosData, error: membrosError } = await supabase
        .from('membros')
        .select('id, nome, data_nascimento, cargo')
        .eq('congregacao_id', congregacaoId)
        .eq('status_espiritual', 'ativo')
        .order('nome', { ascending: true })

      if (membrosError) throw membrosError
      
      // Filtrar manualmente os IDs que já estão no departamento
      membros = (membrosData || []).filter(m => !idsNoDept.includes(m.id))

      // Buscar juventude ativa
      const { data: juventudeData, error: juventudeError } = await supabase
        .from('juventude')
        .select(`
          id,
          nome,
          data_nascimento,
          pai:membros!pai_id(nome),
          mae:membros!mae_id(nome)
        `)
        .eq('congregacao_id', congregacaoId)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (juventudeError) throw juventudeError
      
      // Filtrar manualmente os IDs que já estão no departamento
      juventude = (juventudeData || []).filter(j => !idsNoDept.includes(j.id))
    }

    // Combinar e formatar os dados
    const membrosCombinados = [
      ...(membros || []).map(m => ({
        id: m.id,
        nome: m.nome,
        data_nascimento: m.data_nascimento,
        cargo: m.cargo,
        tipo: 'membro' as const,
        responsaveis: null
      })),
      ...(juventude || []).map(j => ({
        id: j.id,
        nome: j.nome,
        data_nascimento: j.data_nascimento,
        cargo: null,
        tipo: 'juventude' as const,
        responsaveis: {
          pai: j.pai?.nome,
          mae: j.mae?.nome
        }
      }))
    ].sort((a, b) => a.nome.localeCompare(b.nome))

    return { success: true, data: membrosCombinados }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

// Buscar membros e juventude do departamento
export async function getMembrosEJuventudeDepartamento(departamentoId: string) {
  try {
    const { data, error } = await supabase
      .from('membros_departamentos')
      .select('*')
      .eq('departamento_id', departamentoId)
      .eq('ativo', true)
      .order('data_entrada', { ascending: false })

    if (error) throw error

    // Buscar dados de cada integrante baseado no tipo
    const membrosComDados = await Promise.all(
      (data || []).map(async (md) => {
        // Se for juventude, buscar da tabela juventude
        if (md.tipo_integrante === 'juventude') {
          const { data: juventude } = await supabase
            .from('juventude')
            .select(`
              id,
              nome,
              data_nascimento,
              pai:membros!pai_id(nome),
              mae:membros!mae_id(nome)
            `)
            .eq('id', md.membro_id)
            .single()

          if (juventude) {
            return {
              ...md,
              membro: {
                id: juventude.id,
                nome: juventude.nome,
                data_nascimento: juventude.data_nascimento,
                cargo: null,
                tipo: 'juventude',
                responsaveis: {
                  pai: juventude.pai?.nome,
                  mae: juventude.mae?.nome
                }
              }
            }
          }
        }

        // Se for membro, buscar da tabela membros
        const { data: membro } = await supabase
          .from('membros')
          .select('id, nome, foto, data_nascimento, cargo')
          .eq('id', md.membro_id)
          .single()

        if (membro) {
          return {
            ...md,
            membro: {
              ...membro,
              tipo: 'membro',
              responsaveis: null
            }
          }
        }

        return md
      })
    )

    return { success: true, data: membrosComDados }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

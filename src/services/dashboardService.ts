import { supabase } from './supabaseClient'

export interface DashboardStats {
  totalMembros: number
  novosConvertidos: number
  cargosAtivos: number
  totalDizimos: number
}

export interface DizimosPorMes {
  mes: string
  dizimos: number
  ofertas: number
  total: number
}

export interface CrescimentoMembros {
  mes: string
  total: number
  novos: number
}

export async function getDashboardStats(congregacaoId?: string) {
  try {
    // Total de membros
    let queryMembros = supabase
      .from('membros')
      .select('id', { count: 'exact', head: true })
    
    if (congregacaoId) {
      queryMembros = queryMembros.eq('congregacao_id', congregacaoId)
    }
    
    const { count: totalMembros } = await queryMembros

    // Novos convertidos do mês
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    let queryConvertidos = supabase
      .from('convertidos')
      .select('id', { count: 'exact', head: true })
      .gte('data_conversao', inicioMes.toISOString())
    
    if (congregacaoId) {
      queryConvertidos = queryConvertidos.eq('congregacao_id', congregacaoId)
    }
    
    const { count: novosConvertidos } = await queryConvertidos

    // Cargos ativos
    let queryCargos = supabase
      .from('cargos')
      .select('id', { count: 'exact', head: true })
    
    if (congregacaoId) {
      queryCargos = queryCargos.or(`congregacao_id.eq.${congregacaoId},congregacao_id.is.null`)
    }
    
    const { count: cargosAtivos } = await queryCargos

    // Total de dízimos do mês
    let queryDizimos = supabase
      .from('dizimos')
      .select('valor')
      .gte('data', inicioMes.toISOString())
    
    if (congregacaoId) {
      queryDizimos = queryDizimos.eq('congregacao_id', congregacaoId)
    }
    
    const { data: dizimosData } = await queryDizimos

    const totalDizimos = dizimosData?.reduce((acc, d) => acc + Number(d.valor), 0) || 0

    return {
      success: true,
      data: {
        totalMembros: totalMembros || 0,
        novosConvertidos: novosConvertidos || 0,
        cargosAtivos: cargosAtivos || 0,
        totalDizimos,
      },
    }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getDizimosPorMes(congregacaoId?: string, meses: number = 6) {
  try {
    const dataInicio = new Date()
    dataInicio.setMonth(dataInicio.getMonth() - meses)
    dataInicio.setDate(1)

    let query = supabase
      .from('dizimos')
      .select('valor, tipo, data')
      .gte('data', dataInicio.toISOString())
      .order('data', { ascending: true })
    
    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }
    
    const { data, error } = await query

    if (error) throw error

    // Agrupar por mês
    const mesesMap = new Map<string, { dizimos: number; ofertas: number }>()

    data?.forEach((item) => {
      const date = new Date(item.data)
      const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`
      
      if (!mesesMap.has(mesAno)) {
        mesesMap.set(mesAno, { dizimos: 0, ofertas: 0 })
      }
      
      const valores = mesesMap.get(mesAno)!
      if (item.tipo === 'dizimo') {
        valores.dizimos += Number(item.valor)
      } else {
        valores.ofertas += Number(item.valor)
      }
    })

    // Converter para array
    const resultado: DizimosPorMes[] = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = meses - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`
      const valores = mesesMap.get(mesAno) || { dizimos: 0, ofertas: 0 }
      
      resultado.push({
        mes: `${mesesNomes[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`,
        dizimos: valores.dizimos,
        ofertas: valores.ofertas,
        total: valores.dizimos + valores.ofertas,
      })
    }

    return { success: true, data: resultado }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getCrescimentoMembros(congregacaoId?: string, meses: number = 6) {
  try {
    const dataInicio = new Date()
    dataInicio.setMonth(dataInicio.getMonth() - meses)
    dataInicio.setDate(1)

    let query = supabase
      .from('membros')
      .select('created_at')
      .gte('created_at', dataInicio.toISOString())
      .order('created_at', { ascending: true })
    
    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }
    
    const { data, error } = await query

    if (error) throw error

    // Agrupar por mês
    const mesesMap = new Map<string, number>()

    data?.forEach((item) => {
      const date = new Date(item.created_at)
      const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`
      
      mesesMap.set(mesAno, (mesesMap.get(mesAno) || 0) + 1)
    })

    // Converter para array com total acumulado
    const resultado: CrescimentoMembros[] = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    let totalAcumulado = 0
    
    for (let i = meses - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`
      const novos = mesesMap.get(mesAno) || 0
      totalAcumulado += novos
      
      resultado.push({
        mes: `${mesesNomes[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`,
        novos,
        total: totalAcumulado,
      })
    }

    return { success: true, data: resultado }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

export async function getStatusConvertidos(congregacaoId?: string) {
  try {
    let query = supabase
      .from('convertidos')
      .select('status_etapa')
    
    if (congregacaoId) {
      query = query.eq('congregacao_id', congregacaoId)
    }
    
    const { data, error } = await query

    if (error) throw error

    const stats = {
      iniciado: 0,
      em_andamento: 0,
      concluido: 0,
    }

    data?.forEach((item) => {
      if (item.status_etapa === 'iniciado') stats.iniciado++
      else if (item.status_etapa === 'em_andamento') stats.em_andamento++
      else if (item.status_etapa === 'concluido') stats.concluido++
    })

    const resultado = [
      { name: 'Iniciado', value: stats.iniciado, color: '#fbbf24' },
      { name: 'Em Andamento', value: stats.em_andamento, color: '#3b82f6' },
      { name: 'Concluído', value: stats.concluido, color: '#10b981' },
    ]

    return { success: true, data: resultado }
  } catch (error: any) {
    // Error logged
    return { success: false, error: error.message }
  }
}

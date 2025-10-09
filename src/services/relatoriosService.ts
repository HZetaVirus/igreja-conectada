import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Tipos
interface RelatorioMembro {
  nome: string
  data_nascimento: string
  cargo: string
  status_espiritual: string
  telefone: string
  email: string
}

interface RelatorioDizimo {
  data: string
  tipo: string
  membro: string
  valor: number
  observacao: string
}

interface RelatorioConvertido {
  nome: string
  data_conversao: string
  discipulador: string
  status_etapa: string
  telefone: string
}

// Exportar Membros para CSV
export function exportarMembrosCSV(membros: any[], nomeArquivo: string = 'membros') {
  const headers = ['Nome', 'Data Nascimento', 'Cargo', 'Status', 'Telefone', 'Email']
  
  const rows = membros.map(m => [
    m.nome,
    format(new Date(m.data_nascimento), 'dd/MM/yyyy'),
    m.cargo || '-',
    m.status_espiritual,
    m.telefone || '-',
    m.email || '-',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadCSV(csvContent, `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
}

// Exportar Membros para PDF
export function exportarMembrosPDF(membros: any[], congregacao: string = 'Todas') {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório de Membros', 14, 20)
  
  // Informações
  doc.setFontSize(10)
  doc.text(`Congregação: ${congregacao}`, 14, 30)
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 36)
  doc.text(`Total de membros: ${membros.length}`, 14, 42)

  // Tabela
  const tableData = membros.map(m => [
    m.nome,
    format(new Date(m.data_nascimento), 'dd/MM/yyyy'),
    m.cargo || '-',
    m.status_espiritual,
    m.telefone || '-',
  ])

  autoTable(doc, {
    startY: 50,
    head: [['Nome', 'Nascimento', 'Cargo', 'Status', 'Telefone']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] },
  })

  doc.save(`relatorio_membros_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

// Exportar Dízimos para CSV
export function exportarDizimosCSV(dizimos: any[], nomeArquivo: string = 'dizimos') {
  const headers = ['Data', 'Tipo', 'Membro', 'Valor', 'Observação']
  
  const rows = dizimos.map(d => [
    format(new Date(d.data), 'dd/MM/yyyy'),
    d.tipo === 'dizimo' ? 'Dízimo' : 'Oferta',
    d.membro?.nome || '-',
    `R$ ${Number(d.valor).toFixed(2)}`,
    d.observacao || '-',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadCSV(csvContent, `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
}

// Exportar Dízimos para PDF
export function exportarDizimosPDF(dizimos: any[], congregacao: string = 'Todas', periodo?: { inicio: string, fim: string }) {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório Financeiro', 14, 20)
  
  // Informações
  doc.setFontSize(10)
  doc.text(`Congregação: ${congregacao}`, 14, 30)
  if (periodo) {
    doc.text(`Período: ${format(new Date(periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(periodo.fim), 'dd/MM/yyyy')}`, 14, 36)
  }
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 42)

  // Totalizadores
  const totalDizimos = dizimos.filter(d => d.tipo === 'dizimo').reduce((acc, d) => acc + Number(d.valor), 0)
  const totalOfertas = dizimos.filter(d => d.tipo === 'oferta').reduce((acc, d) => acc + Number(d.valor), 0)
  const totalGeral = totalDizimos + totalOfertas

  doc.text(`Total de Dízimos: R$ ${totalDizimos.toFixed(2)}`, 14, 48)
  doc.text(`Total de Ofertas: R$ ${totalOfertas.toFixed(2)}`, 14, 54)
  doc.setFont(undefined, 'bold')
  doc.text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, 14, 60)
  doc.setFont(undefined, 'normal')

  // Tabela
  const tableData = dizimos.map(d => [
    format(new Date(d.data), 'dd/MM/yyyy'),
    d.tipo === 'dizimo' ? 'Dízimo' : 'Oferta',
    d.membro?.nome || '-',
    `R$ ${Number(d.valor).toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: 68,
    head: [['Data', 'Tipo', 'Membro', 'Valor']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] },
    foot: [[
      '',
      '',
      'Total:',
      `R$ ${totalGeral.toFixed(2)}`
    ]],
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
  })

  doc.save(`relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

// Exportar Convertidos para CSV
export function exportarConvertidosCSV(convertidos: any[], nomeArquivo: string = 'convertidos') {
  const headers = ['Nome', 'Data Conversão', 'Discipulador', 'Status', 'Telefone']
  
  const rows = convertidos.map(c => [
    c.nome,
    format(new Date(c.data_conversao), 'dd/MM/yyyy'),
    c.discipulador?.nome || 'Sem discipulador',
    c.status_etapa,
    c.telefone || '-',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadCSV(csvContent, `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
}

// Exportar Convertidos para PDF
export function exportarConvertidosPDF(convertidos: any[], congregacao: string = 'Todas') {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório de Novos Convertidos', 14, 20)
  
  // Informações
  doc.setFontSize(10)
  doc.text(`Congregação: ${congregacao}`, 14, 30)
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 36)
  doc.text(`Total de convertidos: ${convertidos.length}`, 14, 42)

  // Estatísticas
  const iniciado = convertidos.filter(c => c.status_etapa === 'iniciado').length
  const emAndamento = convertidos.filter(c => c.status_etapa === 'em_andamento').length
  const concluido = convertidos.filter(c => c.status_etapa === 'concluido').length

  doc.text(`Iniciado: ${iniciado} | Em Andamento: ${emAndamento} | Concluído: ${concluido}`, 14, 48)

  // Tabela
  const tableData = convertidos.map(c => [
    c.nome,
    format(new Date(c.data_conversao), 'dd/MM/yyyy'),
    c.discipulador?.nome || 'Sem discipulador',
    c.status_etapa,
    c.telefone || '-',
  ])

  autoTable(doc, {
    startY: 56,
    head: [['Nome', 'Conversão', 'Discipulador', 'Status', 'Telefone']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] },
  })

  doc.save(`relatorio_convertidos_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

// Função auxiliar para download de CSV
function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Relatório Consolidado (Dashboard)
export function exportarRelatorioConsolidadoPDF(
  stats: any,
  congregacao: string = 'Todas',
  periodo: string = 'Mês Atual'
) {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(20)
  doc.text('Relatório Consolidado', 14, 20)
  
  // Informações
  doc.setFontSize(10)
  doc.text(`Congregação: ${congregacao}`, 14, 32)
  doc.text(`Período: ${periodo}`, 14, 38)
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 44)

  // Linha separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 48, 196, 48)

  // Estatísticas Gerais
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Estatísticas Gerais', 14, 58)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)

  const yStart = 68
  const lineHeight = 8

  doc.text(`Total de Membros: ${stats.totalMembros}`, 20, yStart)
  doc.text(`Novos Convertidos (mês): ${stats.novosConvertidos}`, 20, yStart + lineHeight)
  doc.text(`Cargos Ativos: ${stats.cargosAtivos}`, 20, yStart + lineHeight * 2)
  doc.text(`Dízimos do Mês: R$ ${stats.totalDizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yStart + lineHeight * 3)

  // Linha separadora
  doc.line(14, yStart + lineHeight * 4 + 4, 196, yStart + lineHeight * 4 + 4)

  // Observações
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Observações', 14, yStart + lineHeight * 5 + 8)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text('Este relatório apresenta um resumo consolidado das atividades da congregação.', 14, yStart + lineHeight * 6 + 8)
  doc.text('Para informações detalhadas, consulte os relatórios específicos de cada área.', 14, yStart + lineHeight * 7 + 8)

  // Rodapé
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Igreja Conectada - Sistema de Gestão', 14, 280)
  doc.text(`Página 1 de 1`, 180, 280)

  doc.save(`relatorio_consolidado_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

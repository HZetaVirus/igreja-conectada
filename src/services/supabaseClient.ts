import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas
export interface Usuario {
  id: string
  email: string
  senha_hash: string
  nivel_acesso: 'super_admin' | 'admin'
  congregacao_id?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Congregacao {
  id: string
  nome: string
  endereco?: string | null
  responsavel?: string | null
  created_at: string
  updated_at: string
}

export interface Membro {
  id: string
  nome: string
  data_nascimento: string
  cargo?: string | null
  status_espiritual: string
  congregacao_id: string
  foto?: string | null
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  created_at: string
  updated_at: string
}

export interface Dizimo {
  id: string
  membro_id: string
  valor: number
  data: string
  tipo: 'dizimo' | 'oferta'
  congregacao_id: string
  observacao?: string | null
  created_at: string
  updated_at: string
}

export interface Convertido {
  id: string
  nome: string
  data_conversao: string
  discipulador_id?: string | null
  congregacao_id: string
  status_etapa: 'iniciado' | 'em_andamento' | 'concluido'
  telefone?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export interface Cargo {
  id: string
  nome: string
  descricao?: string | null
  congregacao_id?: string | null
  created_at: string
  updated_at: string
}

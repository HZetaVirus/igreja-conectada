import { z } from 'zod'

// Schema para Membro
export const membroSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  data_nascimento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  cargo: z.string().max(50).optional(),
  status_espiritual: z.enum(['ativo', 'inativo', 'afastado', 'transferido']),
  congregacao_id: z.string().uuid('ID de congregação inválido'),
  telefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().max(200).optional(),
  data_batismo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .optional()
    .or(z.literal('')),
  carta_bencao: z.string().max(100).optional(),
  origem_membro: z.string().max(100).optional(),
  congregacao_origem: z.string().max(100).optional(),
})

export type MembroFormData = z.infer<typeof membroSchema>

// Schema para Convertido
export const convertidoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  data_conversao: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  discipulador_id: z.string().uuid().optional().or(z.literal('')),
  congregacao_id: z.string().uuid('ID de congregação inválido'),
  status_etapa: z.enum(['iniciado', 'em_andamento', 'concluido']),
  telefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  observacoes: z.string().max(500).optional(),
})

export type ConvertidoFormData = z.infer<typeof convertidoSchema>

// Schema para Departamento
export const departamentoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500).optional(),
  responsavel_id: z.string().uuid().optional().or(z.literal('')),
  congregacao_id: z.string().uuid('ID de congregação inválido'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  ativo: z.boolean(),
  apenas_juventude: z.boolean().optional(),
})

export type DepartamentoFormData = z.infer<typeof departamentoSchema>

// Schema para Congregação
export const congregacaoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  endereco: z.string().max(200).optional(),
  telefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type CongregacaoFormData = z.infer<typeof congregacaoSchema>

// Schema para Usuário
export const usuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional(),
  nivel_acesso: z.enum(['super_admin', 'admin', 'lider', 'membro']),
  congregacao_id: z.string().uuid('ID de congregação inválido'),
  ativo: z.boolean(),
})

export type UsuarioFormData = z.infer<typeof usuarioSchema>

// Schema para Cargo
export const cargoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  descricao: z.string().max(200).optional(),
})

export type CargoFormData = z.infer<typeof cargoSchema>

// Função helper para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _general: 'Erro de validação' } }
  }
}

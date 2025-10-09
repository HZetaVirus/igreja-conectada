-- Adicionar campos de perfil à tabela congregacoes
ALTER TABLE congregacoes 
ADD COLUMN IF NOT EXISTS foto TEXT,
ADD COLUMN IF NOT EXISTS data_inauguracao DATE,
ADD COLUMN IF NOT EXISTS fundadores TEXT,
ADD COLUMN IF NOT EXISTS cofundadores TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Comentários
COMMENT ON COLUMN congregacoes.foto IS 'URL da foto da congregação';
COMMENT ON COLUMN congregacoes.data_inauguracao IS 'Data de inauguração do templo';
COMMENT ON COLUMN congregacoes.fundadores IS 'Nomes dos fundadores';
COMMENT ON COLUMN congregacoes.cofundadores IS 'Nomes dos cofundadores';
COMMENT ON COLUMN congregacoes.telefone IS 'Telefone de contato';
COMMENT ON COLUMN congregacoes.email IS 'Email de contato';
COMMENT ON COLUMN congregacoes.descricao IS 'Descrição da congregação';

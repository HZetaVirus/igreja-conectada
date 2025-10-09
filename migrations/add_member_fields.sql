-- Adicionar novos campos à tabela de membros
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE membros 
ADD COLUMN IF NOT EXISTS data_batismo DATE,
ADD COLUMN IF NOT EXISTS carta_bencao TEXT,
ADD COLUMN IF NOT EXISTS origem_membro TEXT,
ADD COLUMN IF NOT EXISTS congregacao_origem TEXT;

-- Comentários para documentação
COMMENT ON COLUMN membros.data_batismo IS 'Data do batismo do membro';
COMMENT ON COLUMN membros.carta_bencao IS 'Possui carta de benção apostólica (sim/nao)';
COMMENT ON COLUMN membros.origem_membro IS 'Origem do membro (evangelismo/transferencia)';
COMMENT ON COLUMN membros.congregacao_origem IS 'Nome da congregação de origem (se transferência)';

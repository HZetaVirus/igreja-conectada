-- Criar tabela de departamentos
CREATE TABLE IF NOT EXISTS departamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  responsavel_id UUID REFERENCES membros(id) ON DELETE SET NULL,
  congregacao_id UUID NOT NULL REFERENCES congregacoes(id) ON DELETE CASCADE,
  cor VARCHAR(7) DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de membros_departamentos (relacionamento N:N)
CREATE TABLE IF NOT EXISTS membros_departamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  departamento_id UUID NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  data_entrada DATE DEFAULT CURRENT_DATE,
  cargo_departamento VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(membro_id, departamento_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_departamentos_congregacao ON departamentos(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_departamentos_responsavel ON departamentos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_membros_departamentos_membro ON membros_departamentos(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_departamentos_departamento ON membros_departamentos(departamento_id);

-- RLS Policies para departamentos
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver departamentos de sua congregação"
ON departamentos FOR SELECT
TO authenticated
USING (
  congregacao_id IN (
    SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar departamentos em sua congregação"
ON departamentos FOR INSERT
TO authenticated
WITH CHECK (
  congregacao_id IN (
    SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar departamentos de sua congregação"
ON departamentos FOR UPDATE
TO authenticated
USING (
  congregacao_id IN (
    SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar departamentos de sua congregação"
ON departamentos FOR DELETE
TO authenticated
USING (
  congregacao_id IN (
    SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
  )
);

-- RLS Policies para membros_departamentos
ALTER TABLE membros_departamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver membros de departamentos de sua congregação"
ON membros_departamentos FOR SELECT
TO authenticated
USING (
  departamento_id IN (
    SELECT id FROM departamentos WHERE congregacao_id IN (
      SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Usuários podem adicionar membros a departamentos de sua congregação"
ON membros_departamentos FOR INSERT
TO authenticated
WITH CHECK (
  departamento_id IN (
    SELECT id FROM departamentos WHERE congregacao_id IN (
      SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Usuários podem atualizar membros de departamentos de sua congregação"
ON membros_departamentos FOR UPDATE
TO authenticated
USING (
  departamento_id IN (
    SELECT id FROM departamentos WHERE congregacao_id IN (
      SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Usuários podem remover membros de departamentos de sua congregação"
ON membros_departamentos FOR DELETE
TO authenticated
USING (
  departamento_id IN (
    SELECT id FROM departamentos WHERE congregacao_id IN (
      SELECT congregacao_id FROM usuarios WHERE id = auth.uid()
    )
  )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_departamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departamentos_updated_at
BEFORE UPDATE ON departamentos
FOR EACH ROW
EXECUTE FUNCTION update_departamentos_updated_at();

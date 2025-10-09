-- Criar bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de fotos (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos');

-- Política para permitir leitura pública das fotos
CREATE POLICY "Fotos são públicas para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotos');

-- Política para permitir atualização de fotos (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fotos');

-- Política para permitir exclusão de fotos (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fotos');

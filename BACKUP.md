# 📦 Sistema de Backup Automático

## Visão Geral

O sistema possui uma Edge Function que realiza backup automático diário de todas as tabelas do banco de dados e envia por email.

## Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no Supabase:

```bash
SUPABASE_URL=sua-url-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
RESEND_API_KEY=sua-chave-resend (opcional)
```

### 2. Deploy da Edge Function

```bash
# Fazer deploy da função
supabase functions deploy backup-diario

# Configurar secrets
supabase secrets set RESEND_API_KEY=sua-chave-aqui
```

### 3. Configurar Email de Destino

Edite o arquivo `supabase/functions/backup-diario/index.ts` e altere o email de destino:

```typescript
to: ['seu-email@dominio.com'],
```

## Agendamento Automático

### Opção 1: Cron Job do Supabase (Recomendado)

Configure um cron job no Supabase para executar diariamente:

```sql
-- Criar extensão pg_cron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar backup diário às 2h da manhã
SELECT cron.schedule(
  'backup-diario',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/backup-diario',
    headers := '{"Authorization": "Bearer sua-anon-key"}'::jsonb
  );
  $$
);
```

### Opção 2: GitHub Actions

Crie `.github/workflows/backup.yml`:

```yaml
name: Backup Diário

on:
  schedule:
    - cron: '0 2 * * *' # Diariamente às 2h UTC
  workflow_dispatch: # Permite execução manual

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Executar Backup
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://seu-projeto.supabase.co/functions/v1/backup-diario
```

### Opção 3: Serviço Externo (cron-job.org)

1. Acesse https://cron-job.org
2. Crie uma conta gratuita
3. Configure um novo cron job:
   - URL: `https://seu-projeto.supabase.co/functions/v1/backup-diario`
   - Método: POST
   - Header: `Authorization: Bearer sua-anon-key`
   - Frequência: Diariamente às 2h

## Execução Manual

### Via API

```bash
curl -X POST \
  -H "Authorization: Bearer sua-anon-key" \
  https://seu-projeto.supabase.co/functions/v1/backup-diario
```

### Via Interface do Sistema

Adicione um botão no painel administrativo para executar backup manual.

## Dados Incluídos no Backup

O backup inclui todas as tabelas principais:

- ✅ Congregações
- ✅ Usuários (sem senhas)
- ✅ Membros
- ✅ Convertidos
- ✅ Departamentos
- ✅ Membros dos Departamentos
- ✅ Famílias
- ✅ Juventude

## Formato do Backup

O backup é gerado em formato JSON com a seguinte estrutura:

```json
{
  "congregacoes": [...],
  "usuarios": [...],
  "membros": [...],
  "convertidos": [...],
  "departamentos": [...],
  "membros_departamentos": [...],
  "familias": [...],
  "juventude": [...]
}
```

## Restauração de Backup

Para restaurar um backup:

1. Baixe o arquivo JSON do email
2. Use o script de restauração:

```typescript
// restore-backup.ts
import { createClient } from '@supabase/supabase-js'
import backupData from './backup.json'

const supabase = createClient(url, key)

async function restore() {
  // Restaurar cada tabela
  for (const [table, data] of Object.entries(backupData)) {
    await supabase.from(table).upsert(data)
  }
}
```

## Segurança

- ⚠️ **Senhas não são incluídas** no backup por segurança
- 🔒 Use HTTPS para todas as comunicações
- 🔑 Mantenha as chaves de API seguras
- 📧 Configure emails apenas para administradores autorizados

## Monitoramento

Verifique os logs da Edge Function:

```bash
supabase functions logs backup-diario
```

## Troubleshooting

### Email não está sendo enviado

1. Verifique se `RESEND_API_KEY` está configurado
2. Confirme que o email de destino está correto
3. Verifique os logs da função

### Backup está falhando

1. Verifique as permissões do Service Role Key
2. Confirme que todas as tabelas existem
3. Verifique os logs para erros específicos

## Custos

- Edge Functions: Gratuito até 500k invocações/mês
- Resend: Gratuito até 100 emails/dia
- Armazenamento: Considere limpar backups antigos

## Próximos Passos

- [ ] Implementar rotação de backups (manter últimos 30 dias)
- [ ] Adicionar backup incremental
- [ ] Criar interface para download de backups
- [ ] Implementar backup em múltiplos destinos (S3, Google Drive)

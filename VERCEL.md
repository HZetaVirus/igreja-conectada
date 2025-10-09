# 🚀 Deploy na Vercel

Guia completo para fazer deploy do sistema na Vercel.

## Pré-requisitos

- Conta na Vercel (gratuita): https://vercel.com
- Conta no GitHub (para conectar o repositório)
- Projeto Supabase configurado

## Passo 1: Preparar o Projeto

### 1.1 Criar arquivo de configuração da Vercel

O arquivo `vercel.json` já está configurado no projeto com:
- Redirecionamento de rotas para SPA
- Configurações de build otimizadas

### 1.2 Verificar variáveis de ambiente

Certifique-se que o arquivo `.env.example` está atualizado:

```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Passo 2: Subir para o GitHub

### 2.1 Inicializar Git (se ainda não fez)

```bash
cd igreja
git init
git add .
git commit -m "Initial commit - Sistema de Gestão de Igreja"
```

### 2.2 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `sistema-igreja` (ou outro nome)
3. Deixe como **privado** (recomendado)
4. NÃO inicialize com README (já temos)
5. Clique em "Create repository"

### 2.3 Conectar e enviar código

```bash
git remote add origin https://github.com/SEU-USUARIO/sistema-igreja.git
git branch -M main
git push -u origin main
```

## Passo 3: Deploy na Vercel

### 3.1 Importar Projeto

1. Acesse https://vercel.com
2. Clique em "Add New..." → "Project"
3. Clique em "Import Git Repository"
4. Selecione seu repositório `sistema-igreja`
5. Clique em "Import"

### 3.2 Configurar Build

A Vercel detecta automaticamente que é um projeto Vite. Confirme:

- **Framework Preset**: Vite
- **Root Directory**: `igreja` (se o projeto está nessa pasta)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Adicionar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-chave-anonima-aqui
```

**IMPORTANTE**: 
- Copie as chaves do seu projeto Supabase
- Vá em: Supabase Dashboard → Settings → API
- Use a URL do projeto e a chave `anon` (public)

### 3.4 Deploy

1. Clique em "Deploy"
2. Aguarde o build (1-3 minutos)
3. Pronto! Seu site estará no ar

## Passo 4: Configurar Domínio (Opcional)

### 4.1 Domínio Vercel (Gratuito)

Seu projeto terá um domínio automático:
```
https://sistema-igreja.vercel.app
```

### 4.2 Domínio Personalizado

1. Na dashboard do projeto, vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções da Vercel

## Passo 5: Configurar Supabase para Produção

### 5.1 Adicionar URL da Vercel nas configurações

1. Acesse Supabase Dashboard
2. Vá em "Authentication" → "URL Configuration"
3. Adicione em "Site URL":
   ```
   https://seu-projeto.vercel.app
   ```
4. Adicione em "Redirect URLs":
   ```
   https://seu-projeto.vercel.app/**
   ```

### 5.2 Configurar CORS (se necessário)

No Supabase, vá em "Settings" → "API" e adicione:
```
https://seu-projeto.vercel.app
```

## Passo 6: Testar o Deploy

1. Acesse a URL do seu projeto
2. Teste o login
3. Teste criar um membro
4. Teste todas as funcionalidades principais

## Atualizações Futuras

### Deploy Automático

Toda vez que você fizer push para o GitHub, a Vercel faz deploy automático:

```bash
# Fazer alterações no código
git add .
git commit -m "Descrição das mudanças"
git push
```

A Vercel detecta e faz deploy automaticamente!

### Deploy Manual

Se preferir controlar quando fazer deploy:

1. Na Vercel, vá em "Settings" → "Git"
2. Desabilite "Auto Deploy"
3. Para fazer deploy manual, clique em "Deploy" na dashboard

## Troubleshooting

### Erro: "Failed to load module"

**Solução**: Limpe o cache e faça rebuild
```bash
npm run build
```
Depois faça novo deploy na Vercel.

### Erro: "Environment variables not found"

**Solução**: 
1. Verifique se as variáveis estão corretas na Vercel
2. Vá em "Settings" → "Environment Variables"
3. Adicione novamente se necessário
4. Faça "Redeploy" do projeto

### Erro: "404 on page refresh"

**Solução**: O arquivo `vercel.json` deve ter:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Erro de CORS

**Solução**: Configure no Supabase:
1. Settings → API → CORS
2. Adicione a URL da Vercel

## Monitoramento

### Analytics da Vercel

A Vercel oferece analytics gratuito:
- Acesse "Analytics" na dashboard
- Veja visitantes, performance, etc.

### Logs

Para ver logs de erro:
1. Vá em "Deployments"
2. Clique no deployment ativo
3. Vá em "Functions" → "Logs"

## Custos

### Plano Gratuito Vercel

- ✅ Deploy ilimitado
- ✅ 100GB bandwidth/mês
- ✅ HTTPS automático
- ✅ Domínio .vercel.app
- ✅ Deploy automático do Git

**Suficiente para a maioria das igrejas!**

### Quando Upgrade?

Considere upgrade se:
- Mais de 100GB bandwidth/mês
- Precisa de mais de 3 membros na equipe
- Quer analytics avançado

## Segurança

### Checklist de Segurança

- ✅ Variáveis de ambiente configuradas
- ✅ Chaves do Supabase corretas
- ✅ RLS habilitado no Supabase
- ✅ HTTPS ativo (automático na Vercel)
- ✅ Domínio configurado no Supabase

### Backup

Lembre-se de configurar backup automático:
- Veja `BACKUP.md` para instruções

## Suporte

### Documentação Oficial

- Vercel: https://vercel.com/docs
- Vite: https://vitejs.dev/guide/
- Supabase: https://supabase.com/docs

### Problemas Comuns

Se tiver problemas, verifique:
1. Logs na Vercel
2. Console do navegador (F12)
3. Configurações do Supabase

## Próximos Passos

Após o deploy:

1. ✅ Configure backup automático
2. ✅ Adicione domínio personalizado
3. ✅ Configure analytics
4. ✅ Treine os usuários
5. ✅ Monitore o uso

---

**Parabéns! Seu sistema está no ar! 🎉**

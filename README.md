# ⛪ Igreja Conectada

> Sistema completo de gestão eclesiástica com controle de membros, dízimos, departamentos e muito mais.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

---

## 🚀 Funcionalidades

### 👥 Gestão de Membros

- Cadastro completo com foto
- Informações familiares (cônjuge, filhos)
- Histórico de batismo e conversão
- Filtros avançados e busca

### 💰 Controle Financeiro

- Registro de dízimos e ofertas
- Relatórios por período
- Totalizadores automáticos
- Exportação CSV/PDF

### ✨ Novos Convertidos

- Acompanhamento de discipulado

### 💾 Backup Automático

- Backup diário automático de todas as tabelas
- Envio por email com arquivo JSON
- Execução manual via painel administrativo
- Estatísticas detalhadas do backup
- Documentação completa em `BACKUP.md`

### ⚙️ Configurações

- Painel administrativo completo
- Informações do sistema
- Status de segurança
- Ferramentas de manutenção
- Status de etapas
- Vinculação com discipulador
- Histórico completo

### 📁 Departamentos

- Organização por ministérios
- Gestão de integrantes
- Responsáveis e cargos
- Departamentos infantis (juventude)

### 👶 Juventude

- Cadastro de crianças/adolescentes
- Vínculo com responsáveis (pai/mãe)
- Filtros por faixa etária
- Integração com departamentos

### 📊 Relatórios

- Membros, dízimos, convertidos
- Filtros personalizados
- Exportação PDF e CSV
- Gráficos e estatísticas

---

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** TailwindCSS
- **Backend:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Roteamento:** React Router v6
- **Formulários:** React Hook Form
- **Datas:** date-fns
- **PDF:** jsPDF + autoTable

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/igreja-conectada.git
cd igreja-conectada/igreja
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 🗄️ Configuração do Banco de Dados

### 1. Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Execute as migrations

As migrations estão em `igreja/supabase/migrations/`. Execute-as na ordem:

1. `20240101000000_initial_schema.sql` - Estrutura inicial
2. `20240102000000_add_familias.sql` - Tabelas de família
3. `20240103000000_add_departamentos.sql` - Departamentos

Ou use o Supabase CLI:

```bash
supabase db push
```

### 3. Crie o primeiro usuário

Execute no SQL Editor do Supabase:

```sql
-- Criar congregação
INSERT INTO congregacoes (nome, endereco, telefone, email)
VALUES ('Minha Igreja', 'Rua Exemplo, 123', '(11) 99999-9999', 'contato@igreja.com');

-- Criar usuário admin
INSERT INTO usuarios (email, nome, role, congregacao_id)
VALUES (
  'admin@igreja.com',
  'Administrador',
  'super_admin',
  (SELECT id FROM congregacoes LIMIT 1)
);
```

---

## 🔐 Autenticação

### Usuários e Permissões

| Papel           | Permissões                |
| --------------- | ------------------------- |
| **super_admin** | Acesso total ao sistema   |
| **admin**       | Gestão da congregação     |
| **pastor**      | Visualização e relatórios |
| **secretario**  | Cadastros básicos         |
| **tesoureiro**  | Gestão financeira         |

### Login

Use o email cadastrado no Supabase Auth. A senha é definida no primeiro acesso.

---

## 📱 Deploy

### Vercel (Recomendado)

**📖 [Guia Completo de Deploy na Vercel](VERCEL.md)**

Passos rápidos:

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

```bash
# Ou via CLI
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🎨 Personalização

### Cores

Edite `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... suas cores
      }
    }
  }
}
```

### Logo

Substitua o ícone em `Login.tsx` e adicione seu logo em `public/`.

---

## 📚 Estrutura do Projeto

```
igreja/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Context API (Auth, Toast)
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços e API
│   └── App.tsx         # Componente principal
├── public/             # Arquivos estáticos
└── supabase/           # Migrations e configurações
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Suporte

- 📧 Email: suporte@igrejaconectada.com
- 💬 Discord: [Entre no servidor](https://discord.gg/exemplo)
- 📖 Documentação: [docs.igrejaconectada.com](https://docs.igrejaconectada.com)

---

## ⭐ Agradecimentos

Desenvolvido com ❤️ para igrejas que desejam modernizar sua gestão.

**Que Deus abençoe seu ministério!** 🙏

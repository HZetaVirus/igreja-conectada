#!/bin/bash

# Script de Deploy Rápido para Vercel
# Execute: bash deploy.sh

echo "🚀 Iniciando deploy para Vercel..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta 'igreja'"
    exit 1
fi

# Verificar se tem .env
if [ ! -f ".env" ]; then
    echo "⚠️  Aviso: Arquivo .env não encontrado"
    echo "📝 Copie .env.example para .env e configure suas variáveis"
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Importe seu repositório do GitHub"
echo "3. Configure as variáveis de ambiente"
echo "4. Faça o deploy!"
echo ""
echo "📖 Veja VERCEL.md para instruções detalhadas"

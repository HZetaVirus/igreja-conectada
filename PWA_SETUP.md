# 📱 PWA - Igreja Conectada

## ✅ O que foi implementado:

### 1. Service Worker (Cache Inteligente)

- ✅ Cache de assets estáticos (HTML, CSS, JS)
- ✅ Cache de requisições da API Supabase
- ✅ Estratégia Network First para dados
- ✅ Fallback para cache quando offline
- ✅ Sincronização automática quando volta online

### 2. Manifest PWA

- ✅ Configuração para instalação
- ✅ Ícones e tema
- ✅ Atalhos rápidos

### 3. Componentes

- ✅ Indicador Online/Offline
- ✅ Botão de instalação do app
- ✅ Hook para gerenciar PWA

## 🎯 Como funciona:

### Quando ONLINE:

1. Busca dados do Supabase normalmente
2. Salva respostas no cache
3. App funciona 100%

### Quando OFFLINE:

1. Mostra notificação "Modo Offline"
2. Busca dados do cache (últimos dados carregados)
3. Interface funciona, mas dados podem estar desatualizados
4. Não permite criar/editar (precisa de internet)

### Quando VOLTA ONLINE:

1. Mostra notificação "Conectado"
2. Sincroniza automaticamente
3. Atualiza dados do cache

## 📦 Gerando Ícones:

Você precisa criar 2 ícones PNG:

### Opção 1: Online (Recomendado)

Use: https://www.pwabuilder.com/imageGenerator

1. Faça upload de um logo da igreja (512x512px ou maior)
2. Baixe os ícones gerados
3. Renomeie para `icon-192.png` e `icon-512.png`
4. Coloque na pasta `public/`

### Opção 2: Manual

Crie 2 imagens PNG:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

Coloque na pasta `public/`

## 🚀 Como instalar o PWA:

### Android (Chrome):

1. Abra o site no Chrome
2. Clique no banner "Instalar App" OU
3. Menu (⋮) → "Adicionar à tela inicial"

### iOS (Safari):

1. Abra o site no Safari
2. Toque no botão Compartilhar (□↑)
3. Role e toque em "Adicionar à Tela de Início"

### Desktop (Chrome/Edge):

1. Abra o site
2. Clique no ícone de instalação na barra de endereço OU
3. Menu (⋮) → "Instalar Igreja Conectada"

## 🧪 Testando Offline:

### Chrome DevTools:

1. Abra DevTools (F12)
2. Aba "Application"
3. Service Workers → Marque "Offline"
4. Recarregue a página

### Modo Avião:

1. Ative o modo avião no dispositivo
2. Abra o app instalado
3. Deve mostrar dados em cache

## ⚙️ Configurações Avançadas:

### Limpar Cache:

```javascript
// No console do navegador
caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
```

### Desregistrar Service Worker:

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
```

## 📊 Monitoramento:

### Ver Cache:

1. DevTools → Application → Cache Storage
2. Veja `igreja-conectada-v1` (assets)
3. Veja `igreja-api-cache-v1` (dados API)

### Ver Service Worker:

1. DevTools → Application → Service Workers
2. Status: Activated and running

## 🔄 Atualizações:

Quando você fizer deploy de uma nova versão:

1. Altere `CACHE_NAME` em `public/sw.js` (ex: v1 → v2)
2. Service Worker detecta mudança
3. Atualiza automaticamente no próximo acesso

## ⚠️ Limitações:

- ❌ Não cria/edita dados offline (precisa de internet)
- ❌ Dados em cache podem estar desatualizados
- ⚠️ iOS tem limitações (cache menor, menos recursos)
- ⚠️ Cache pode ser limpo pelo navegador se ficar sem espaço

## 🎉 Benefícios:

- ✅ Carregamento instantâneo (cache)
- ✅ Funciona com internet lenta
- ✅ Visualiza dados offline
- ✅ Instalável como app nativo
- ✅ Notificações de status
- ✅ Sincronização automática

// Service Worker para Cache Inteligente
const CACHE_NAME = 'igreja-conectada-v1';
const API_CACHE = 'igreja-api-cache-v1';

// Arquivos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para requisições da API Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE)
    );
    return;
  }

  // Estratégia para assets estáticos
  event.respondWith(
    cacheFirstStrategy(request, CACHE_NAME)
  );
});

// Estratégia: Network First (tenta rede primeiro, fallback para cache)
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Se a resposta for bem-sucedida, salva no cache
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Se falhar (offline), busca do cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tiver no cache, retorna erro
    return new Response(
      JSON.stringify({ 
        error: 'Sem conexão com a internet',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia: Cache First (busca cache primeiro, fallback para rede)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Aqui você pode implementar lógica de sincronização
  // Por exemplo, enviar dados salvos localmente quando voltar online
  console.log('Sincronizando dados...');
}

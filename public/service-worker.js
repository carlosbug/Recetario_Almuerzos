const CACHE_NAME = 'mi-app-cache-v1';
const RUTAS_CACHEADAS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];


// Instala y guarda archivos en caché
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Archivos cacheados');
        return cache.addAll(RUTAS_CACHEADAS);
      })
  );
  self.skipWaiting();
});

// Activa y limpia cachés viejos
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta peticiones y responde desde caché o red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(respuesta => respuesta || fetch(event.request))
  );
});

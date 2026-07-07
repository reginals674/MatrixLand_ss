const CACHE = 'matrixland-v1';

// Lista de archivos que se guardarán en el dispositivo
const ARCHIVOS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// INSTALAR: cuando el SW se registra por primera vez,
// guarda todos los archivos en el caché del navegador
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting(); // actívate inmediatamente, sin esperar
});

// ACTIVAR: si hay una versión vieja del caché, bórrala
// Esto es útil cuando actualizas el juego en el futuro
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH: cada vez que la app pide un archivo,
// primero busca en caché — si no está, lo busca en red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
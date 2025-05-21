// Service Worker vazio
// Este arquivo existe apenas para evitar erros 404 quando o navegador tenta carregar sw.js

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Sem comportamento específico, apenas deixe o navegador lidar com as solicitações normalmente
});

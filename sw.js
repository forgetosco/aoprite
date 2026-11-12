/**
 * AOprite — Service Worker Oficial (PWA Offline-First)
 * Estúdio e titular dos direitos autorais: Forge Tosco (2026)
 * Licença: MIT
 *
 * Projetado com caminhos relativos ao escopo do Service Worker (self.registration.scope),
 * garantindo funcionamento 100% offline tanto na raiz de um domínio quanto em subdiretórios
 * do GitHub Pages (ex.: https://usuario.github.io/aoprite/).
 */
(function () {
  'use strict';

  var CACHE_NAME = 'aoprite-pwa-v3.0.0';
  var RELATIVE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './icons/apple-touch-icon.png'
  ];

  function resolveScopeUrls() {
    var base = (self.registration && self.registration.scope) ? self.registration.scope : self.location.href;
    return RELATIVE_ASSETS.map(function (rel) {
      return new URL(rel, base).href;
    });
  }

  self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        var urls = resolveScopeUrls();
        return Promise.all(
          urls.map(function (url) {
            return fetch(url, { cache: 'reload' })
              .then(function (resp) {
                if (resp && resp.status === 200) {
                  return cache.put(url, resp);
                }
              })
              .catch(function () {
                // Ignora silenciosamente ativos secundários caso indisponíveis na rede inicial
              });
          })
        );
      }).then(function () {
        return self.skipWaiting();
      })
    );
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME && key.indexOf('aoprite-pwa-') === 0) {
              return caches.delete(key);
            }
          })
        );
      }).then(function () {
        return self.clients.claim();
      })
    );
  });

  self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (!req || req.method !== 'GET') return;

    var url;
    try {
      url = new URL(req.url);
    } catch (_e) {
      return;
    }

    // Intercepta apenas requisições da mesma origem (zero chamadas externas)
    if (url.origin !== self.location.origin) return;

    var base = (self.registration && self.registration.scope) ? self.registration.scope : self.location.href;
    var indexUrl = new URL('./index.html', base).href;
    var rootUrl = new URL('./', base).href;

    // Navegação HTML: Cache-First com atualização em segundo plano e fallback para index.html
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
      event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
          return cache.match(req.url).then(function (cachedResp) {
            var fetchPromise = fetch(req).then(function (netResp) {
              if (netResp && netResp.status === 200) {
                cache.put(req.url, netResp.clone());
                cache.put(indexUrl, netResp.clone());
                cache.put(rootUrl, netResp.clone());
              }
              return netResp;
            }).catch(function () {
              return cachedResp || cache.match(indexUrl) || cache.match(rootUrl);
            });
            return cachedResp || fetchPromise;
          });
        })
      );
      return;
    }

    // Demais recursos estáticos locais (manifest, ícones, etc.): Cache-First com fallback de rede
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (netResp) {
            if (netResp && netResp.status === 200 && netResp.type === 'basic') {
              cache.put(req, netResp.clone());
            }
            return netResp;
          }).catch(function () {
            if (url.pathname.endsWith('/')) {
              return cache.match(indexUrl);
            }
            return new Response('', { status: 408, statusText: 'Offline' });
          });
        });
      })
    );
  });
})();

/*! coi-serviceworker - credentialless Cross-Origin Isolation helper for static/shared hosting */
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
          newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch(() => fetch(request))
    );
  });
} else {
  (() => {
    if (window.crossOriginIsolated) return;
    if (!('serviceWorker' in navigator)) return;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Optional in dev; register cleanly without forcing reload loops
    }
    navigator.serviceWorker
      .register('./coi-serviceworker.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated' && !window.crossOriginIsolated) {
              if (!sessionStorage.getItem('coiReloaded')) {
                sessionStorage.setItem('coiReloaded', '1');
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(() => {
        // Silently ignore if service worker registration is restricted in sandboxed iframe
      });
  })();
}

(() => {
  'use strict';
  const base = new URL('.', document.baseURI);
  window.roomVibeUpdates = {
    async check() {
      const url = new URL('version.json', base);
      url.searchParams.set('roomvibe-check', Date.now().toString());
      const response = await fetch(url, {
        cache: 'no-store', credentials: 'same-origin',
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Version check failed');
      const text = await response.text();
      if (text.length > 4096) throw new Error('Invalid release manifest');
      return text;
    },
    async reload(version) {
      // Stay in the loaded editor if the connection disappeared after checking.
      await window.roomVibeUpdates.check();
      // Remove only this application's Flutter worker. Project storage and
      // other applications' workers/caches are not touched.
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          const worker = registration.active || registration.waiting || registration.installing;
          if (registration.scope === base.href && worker &&
              new URL(worker.scriptURL).pathname === new URL('flutter_service_worker.js', base).pathname) {
            await registration.unregister();
          }
        }
      }
      const url = new URL(location.href);
      url.searchParams.set('roomvibe-update', version);
      location.replace(url.href);
    },
  };
})();

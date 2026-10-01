self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys.map(key => caches.delete(key))
    );

    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    await self.registration.unregister();

    await Promise.all(
      windows.map(client => {
        const url = new URL(client.url);
        url.searchParams.set('v14reset', Date.now().toString());
        return client.navigate(url.href);
      })
    );
  })());
});

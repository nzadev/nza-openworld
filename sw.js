const CACHE_NAME = "nza-openworld-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/main.js",
  "./js/engine.js",
  "./js/world.js",
  "./js/audio.js",
  "./js/assets.js",
  "./assets/sprites/hero_nza.png",
  "./assets/sprites/mobs.png",
  "./assets/sprites/boss_malakor.png",
  "./assets/sprites/world_tiles.png",
  "./assets/sprites/props_25d.png",
  "./assets/sprites/fx_items.png",
  "./assets/ui/hero_banner.png",
  "./assets/ui/game_icon.png",
  "./assets/ui/icon_192.png",
  "./assets/ui/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

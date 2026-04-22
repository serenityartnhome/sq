const CACHE = "serenity-quest-v85";
const ASSETS = [
  "/",
  "/index.html",
  "/privacy.html",
  "/terms.html",
  "/styles.css",
  "/app.jsx",
  "/manifest.json",
  "/supabase-client.js",
  "/components/Primitives.jsx",
  "/components/Zodiac.jsx",
  "/components/Auth.jsx",
  "/components/Onboarding.jsx",
  "/components/Calendar.jsx",
  "/components/Community.jsx",
  "/components/Dashboard.jsx",
  "/components/Tweaks.jsx",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll({type:"window"}).then(clients =>
       clients.forEach(c => c.postMessage({type:"SW_UPDATED"}))
     ))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

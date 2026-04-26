const CACHE = "serenity-quest-v246";
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
  "/components/Friends.jsx",
  "/components/Dashboard.jsx",
  "/assets/splash-bg.PNG",
  "/assets/icon-mail.png",
  "/assets/icon-friends.png",
  "/assets/icon-share.png",
  "/assets/icon-account-rat.png",
  "/assets/icon-account-ox.png",
  "/assets/icon-account-tiger.png",
  "/assets/icon-account-rabbit.png",
  "/assets/icon-account-dragon.png",
  "/assets/icon-account-snake.png",
  "/assets/icon-account-horse.png",
  "/assets/icon-account-goat.png",
  "/assets/icon-account-monkey.png",
  "/assets/icon-account-rooster.png",
  "/assets/icon-account-dog.png",
  "/assets/icon-account-pig.png",
  "/assets/mood-happy.png",
  "/assets/mood-calm.png",
  "/assets/mood-neutral.png",
  "/assets/mood-sad.png",
  "/assets/mood-frustrated.png",
  "/assets/mood-anxious.png",
  "/assets/mood-tired.png",
  "/assets/mood-excited.png",
  "/assets/egg-hatch-sheet.png",
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

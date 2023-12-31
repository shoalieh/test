// service-worker.js
const CACHE_NAME = "offline-cache";
const OFFLINE_URL = "offline.html";
const ONLINE_URL = "online.html";
const HOME_URL = "index.html";

let isOffline = false;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([OFFLINE_URL, ONLINE_URL, HOME_URL]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // Use the offline page for failed navigations
                    return caches.match(new Request(OFFLINE_URL));
                })
        );
    }
});

self.addEventListener("online", () => {
    isOffline = false;
    clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            // Check if the client is in the offline page
            if (client.url === self.location.href && !isOffline) {
                // Check if the client is in the home page
                if (!client.url.includes(HOME_URL)) {
                    client.navigate(ONLINE_URL);
                }
            }
        });
    });
});

self.addEventListener("offline", () => {
    isOffline = true;
    clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            if (client.url === self.location.href) {
                client.navigate(OFFLINE_URL);
            }
        });
    });
});

setInterval(() => {
    if (navigator.onLine) {
        clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type: 'NAVIGATE_TO_ONLINE' });
            });
        });
    }else if (!navigator.onLine) {
        clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type: 'NAVIGATE_TO_OFFLINE' });
            });
        });
    }
}, 3000);

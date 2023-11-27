const CACHE_NAME = "offline-cache";
const OFFLINE_URL = "offline.html";
const ONLINE_URL = "online.html";
const HOME_URL = "index.html";

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
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        return caches.match(new Request(OFFLINE_URL));
                    });
                })
        );
    }
});

self.addEventListener("online", () => {
    clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            client.navigate(ONLINE_URL);
        });
    });
});

self.addEventListener("offline", () => {
    clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
            client.navigate(OFFLINE_URL);
        });
    });
});
setInterval(() => {
    if (window.navigator.onLine) {
        console.log('online');
    }
}, 3000);

// =================================================================
// PROGRAMACIÓN ORIENTADA A LA WEB - UCAB (Semestre 2-2025)
// PORTAL DE CACHÉ CORREGIDO Y RESILIENTE (sw.js)
// =================================================================

const CACHE_ESTATICO = 'rm-static-v1';
const CACHE_DINAMICO = 'rm-dynamic-v1';

// Lista simplificada y ultra segura (Solo lo estrictamente vital)
const ACTIVOS_ESTATICOS = [
    './index.html',
    './app.js',
    './auth.js',
    './api.js'
];

// --- EVENTO: INSTALACIÓN ---
self.addEventListener('install', (e) => {
    e.waitUntil(
        Promise.all([
            caches.open(CACHE_ESTATICO).then((cache) => {
                console.log('SW: Guardando estructura estática elemental...');
                // Usamos un bucle para mapear de forma segura y que un fallo individual no destruya todo
                return Promise.all(
                    ACTIVOS_ESTATICOS.map(url => {
                        return cache.add(url).catch(err => {
                            console.error(`SW: No se pudo precachear el archivo local: ${url}`, err);
                        });
                    })
                );
            }),
            caches.open(CACHE_DINAMICO).then((cache) => {
                console.log('SW: Inicializando contenedor dinámico para la API...');
            })
        ]).then(() => self.skipWaiting())
    );
});

// --- EVENTO: ACTIVACIÓN ---
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_ESTATICO && key !== CACHE_DINAMICO) {
                        console.log('SW: Eliminando caché antiguo:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// --- EVENTO: FETCH (INTERCEPTOR DE PETICIONES) ---
// --- EVENTO: FETCH (INTERCEPTOR DE PETICIONES CORREGIDO PARA CORS) ---
self.addEventListener('fetch', (e) => {
    const url = e.request.url;

    // INTERCEPTAR RICK & MORTY (Tanto JSON de la API como imágenes de avatares)[cite: 2]
    if (url.includes('rickandmortyapi.com')) {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                // Si ya está guardado con éxito en el Caché, lo servimos de inmediato[cite: 2]
                if (cachedResponse) {
                    return cachedResponse;
                }

                // SI ES UNA IMAGEN: Creamos una nueva Request forzando el modo 'cors'
                // Esto destruye el problema de las respuestas opacas de 0 Bytes
                let requestToFetch = e.request;
                if (url.includes('avatar')) {
                    requestToFetch = new Request(e.request.url, {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'omit'
                    });
                }

                return fetch(requestToFetch).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_DINAMICO).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    // Fallo de red
                });
            })
        );
        return;
    }

    // INTERCEPTAR ARCHIVOS LOCALES
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_DINAMICO).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {});
        })
    );
});
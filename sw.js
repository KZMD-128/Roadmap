/* KZMD128 v4: network-first HTML/JS/CSS; precache current PWA shell for offline use. */
const CACHE='kzmd128-offline-v4';
const FILES=['./','./index.html','./daily.css?v=4','./daily.js?v=4','./manifest.webmanifest','./icons/icon-192-v4.png','./icons/icon-512-v4.png','./icons/icon-maskable-512-v4.png','./icons/apple-touch-icon-v4.png','./icons/favicon-32-v4.png','./brand/kzmd128-symbol.svg'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{try{await (await caches.open(CACHE)).addAll(FILES)}catch(e){}await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE)await caches.delete(key);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
 event.respondWith((async()=>{try{const response=await fetch(req,{cache:'no-cache'});if(response.ok){try{(await caches.open(CACHE)).put(req,response.clone())}catch(e){}}return response}
 catch(e){return (await caches.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?await caches.match('./index.html'):null)||Response.error()}})())});

const CACHE="lloyd-miniled-v2";
const A=["./","./index.html","./app.js","./manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>
  Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{
    const c2=x.clone();caches.open(CACHE).then(c=>c.put(e.request,c2)).catch(()=>{});return x;
  }).catch(()=>caches.match("./index.html"))));});

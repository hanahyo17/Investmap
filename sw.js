/* 현장조사 노트 서비스 워커: 앱 파일을 폰에 저장해 인터넷 없이도 열리게 한다. */
const V = 'field-note-v3';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;          // 배경지도 등 외부 요청은 그대로 인터넷으로
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const net = fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    return hit || net;                                // 저장본을 먼저 보여주고, 새 버전은 뒤에서 받아 둔다
  }));
});

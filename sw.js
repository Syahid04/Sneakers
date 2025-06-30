// // sw.js - Service Worker

// // Nama cache yang digunakan untuk menyimpan file
// const CACHE_NAME = 'sneakpeek-cache-v1';

// // File yang ingin dicache saat instalasi
// const urlsToCache = [
//   '/',
//   '/index.html',
//   '/detail.html',
//   '/sneaker1.jpg',
//   '/sneaker2.jpg',
//   '/sneaker3.jpg',
//   '/sneaker4.jpg',
//   '/style.css', // ubah ke path yang sesuai
//   'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
//   'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
//   'https://fonts.googleapis.com/css2?family=Segoe+UI&display=swap'
// ];



// Event listener untuk tahap "install" dari Service Worker
self.addEventListener("install", async event => {
  // Membuka cache dengan nama "pwa-assets"
  const cache = await caches.open("pwa-assets");

  // Menyimpan semua resource ke dalam cache saat pertama kali Service Worker diinstall
  cache.addAll([
    "./",               // Halaman utama
    "./style.css",      // File CSS
    "./index.html",     // Halaman index
    "./detail.html",    // Halaman detail
    "./sneaker1.jpg",   // Gambar produk sneaker 1
    "./sneaker2.jpg",   // Gambar produk sneaker 2
    "./sneaker3.jpg",   // Gambar produk sneaker 3
    "./sneaker4.jpg"    // Gambar produk sneaker 4
  ]); 
});

// Event listener untuk tahap "fetch", menangani semua permintaan jaringan
self.addEventListener("fetch", event => {
  event.respondWith(
    // Mencocokkan permintaan dengan cache terlebih dahulu
    caches.match(event.request).then(cachedResponse => {
      // Jika ada di cache, kembalikan dari cache; jika tidak, ambil dari jaringan
      return cachedResponse || fetch(event.request);
    })
  )
});




// // Event saat service worker dipasang
// self.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(function(cache) {
//       return cache.addAll(urlsToCache); // Cache semua file yang diperlukan
//     })
//   );
// });

// // Event fetch: mengambil dari cache jika offline
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request).then(function(response) {
//       return response || fetch(event.request); // Ambil dari cache jika tersedia
//     })
//   );
// });

// // Event aktivasi: membersihkan cache lama jika ada
// self.addEventListener('activate', function(event) {
//   event.waitUntil(
//     caches.keys().then(function(cacheNames) {
//       return Promise.all(
//         cacheNames.filter(function(cacheName) {
//           return cacheName !== CACHE_NAME;
//         }).map(function(cacheName) {
//           return caches.delete(cacheName); // Hapus cache lama
//         })
//       );
//     })
//   );
// });

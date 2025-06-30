// app.js - File JavaScript utama untuk aplikasi web sneakers

// Pendaftaran Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(registration) {
      console.log('Service Worker berhasil didaftarkan:', registration.scope);
    })
    .catch(function(error) {
      console.error('Pendaftaran Service Worker gagal:', error);
    });
}

// --- IndexedDB Setup ---
const DB_NAME = 'SneakerFavoritesDB';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';
let db;

/**
 * Membuka koneksi ke IndexedDB.
 * @returns {Promise<IDBDatabase>} Objek database IndexedDB.
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log(`Object store '${STORE_NAME}' created.`);
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('IndexedDB opened successfully.');
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Menambahkan atau memperbarui item favorit di IndexedDB.
 * @param {Object} product - Objek produk untuk ditambahkan.
 * @returns {Promise<void>}
 */
async function addOrUpdateFavorite(product) {
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(product);

    request.onsuccess = () => {
      console.log('Product added/updated in favorites:', product.id);
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error adding/updating product to favorites:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Menghapus item favorit dari IndexedDB.
 * @param {string} id - ID produk yang akan dihapus.
 * @returns {Promise<void>}
 */
async function removeFavorite(id) {
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Product removed from favorites:', id);
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error removing product from favorites:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Memeriksa apakah suatu produk sudah ada di daftar favorit.
 * @param {string} id - ID produk yang akan diperiksa.
 * @returns {Promise<boolean>} True jika produk favorit, false jika tidak.
 */
async function isFavorite(id) {
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(!!request.result);
    };

    request.onerror = (event) => {
      console.error('Error checking favorite status:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Mengambil semua item favorit dari IndexedDB.
 * @returns {Promise<Array<Object>>} Array berisi semua produk favorit.
 */
async function getFavorites() {
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error getting all favorites:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Menampilkan item favorit di halaman.
 */
async function displayFavorites() {
  const favoritesContainer = document.getElementById('favorites-container');
  const noFavoritesMessage = document.getElementById('no-favorites-message');
  
  if (!favoritesContainer || !noFavoritesMessage) return; // Pastikan elemen ada di halaman ini

  favoritesContainer.innerHTML = ''; 
  noFavoritesMessage.style.display = 'none'; 

  try {
    const favorites = await getFavorites();

    if (favorites.length === 0) {
      noFavoritesMessage.style.display = 'block'; 
    } else {
      favorites.forEach(product => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 col-lg-3';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 bg-secondary text-light';

        const imgElement = document.createElement('img');
        imgElement.src = product.image;
        imgElement.className = 'card-img-top';
        imgElement.alt = product.title;
        imgElement.onerror = function() {
            this.onerror=null;
            this.src='https://placehold.co/600x400/343a40/ffffff?text=No+Image';
        };
        cardDiv.appendChild(imgElement);

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const titleElement = document.createElement('h5');
        titleElement.className = 'card-title';
        titleElement.textContent = product.title;
        cardBodyDiv.appendChild(titleElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'card-text';
        descriptionElement.textContent = product.description;
        cardBodyDiv.appendChild(descriptionElement);

        const detailLink = document.createElement('a');
        detailLink.href = `detail.html?id=${product.id}`;
        detailLink.className = 'btn btn-info mt-2';
        detailLink.textContent = 'Lihat Detail';
        cardBodyDiv.appendChild(detailLink);

        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-danger mt-2 remove-from-favorite';
        removeButton.dataset.productId = product.id;
        removeButton.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus dari Favorit';
        removeButton.addEventListener('click', async (event) => {
          const productId = event.currentTarget.dataset.productId;
          await removeFavorite(productId);
          displayFavorites(); // Refresh daftar favorit di halaman ini
          // updateFavoriteButtonState(productId); // Tidak perlu di halaman favorit
        });
        cardBodyDiv.appendChild(removeButton);

        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        favoritesContainer.appendChild(colDiv);
      });
    }
  } catch (error) {
    console.error('Error displaying favorites:', error);
    favoritesContainer.innerHTML = '<div class="col-12 text-center text-danger">Gagal memuat daftar favorit.</div>';
  }
}

/**
 * Memperbarui status tombol favorit untuk produk tertentu (hanya untuk halaman produk).
 * @param {string} productId - ID produk.
 */
async function updateFavoriteButtonState(productId) {
  const button = document.querySelector(`.add-to-favorite[data-product-id="${productId}"]`);
  if (!button) return; // Pastikan tombol ada di halaman ini

  const isFav = await isFavorite(productId);
  if (isFav) {
    button.classList.remove('btn-outline-light');
    button.classList.add('btn-success');
    button.innerHTML = '<i class="fas fa-heart"></i> Sudah di Favoritkan';
  } else {
    button.classList.remove('btn-success');
    button.classList.add('btn-outline-light');
    button.innerHTML = '<i class="far fa-heart"></i> Tambahkan ke Favorit';
  }
}

/**
 * Menginisialisasi status tombol favorit untuk semua produk saat halaman dimuat (hanya untuk halaman produk).
 */
async function initializeFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.add-to-favorite');
  for (const button of favoriteButtons) {
    const productId = button.dataset.productId;
    await updateFavoriteButtonState(productId);
  }
}


// Fungsi untuk menampilkan hasil ke elemen <output>
function showResult(text) {
  const outputElement = document.querySelector("output");
  if (outputElement) {
    outputElement.innerHTML = text;
  } else {
    console.log(text); 
  }
}

// Fungsi untuk mengambil dan menampilkan berita (hanya untuk halaman utama)
async function fetchNews() {
  const newsContainer = document.getElementById('news-container');
  if (!newsContainer) {
    // console.log('Elemen #news-container tidak ditemukan. Tidak memuat berita.');
    return; // Tidak melakukan apa-apa jika elemen tidak ada (misal di halaman favorit)
  }

  newsContainer.innerHTML = '<div class="col-12 text-center">Memuat berita...</div>';

  try {
    const apiKey = "pub_d9d56bfc67754c0d812e2bfe0c58c037"; // Ganti dengan API Key Anda
    const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=nike&category=lifestyle`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      newsContainer.innerHTML = ''; 
      data.results.forEach(article => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 col-lg-4';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 bg-secondary text-light';

        const imageUrl = article.image_url || 'https://placehold.co/600x400/343a40/ffffff?text=No+Image';
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.className = 'card-img-top';
        imgElement.alt = article.title;
        imgElement.onerror = function() {
            this.onerror=null;
            this.src='https://placehold.co/600x400/343a40/ffffff?text=No+Image';
        };
        cardDiv.appendChild(imgElement);

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const titleElement = document.createElement('h5');
        titleElement.className = 'card-title';
        titleElement.textContent = article.title;
        cardBodyDiv.appendChild(titleElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'card-text';
        descriptionElement.textContent = article.description ? article.description.substring(0, 150) + '...' : 'Tidak ada deskripsi.';
        cardBodyDiv.appendChild(descriptionElement);

        const linkElement = document.createElement('a');
        linkElement.href = article.link;
        linkElement.target = '_blank'; 
        linkElement.className = 'btn btn-info';
        linkElement.textContent = 'Baca Selengkapnya';
        cardBodyDiv.appendChild(linkElement);

        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        newsContainer.appendChild(colDiv);
      });
    } else {
      newsContainer.innerHTML = '<div class="col-12 text-center">Tidak ada berita yang ditemukan.</div>';
    }

  } catch (error) {
    console.error('Gagal mengambil berita:', error);
    newsContainer.innerHTML = '<div class="col-12 text-center text-danger">Gagal memuat berita. Silakan coba lagi nanti.</div>';
    showResult("Error fetching news: " + error.message);
  }
}

// --- Main execution when DOM is loaded ---
document.addEventListener('DOMContentLoaded', async () => {
  await openDatabase(); // Buka database saat DOM dimuat

  // Logika untuk halaman index.html
  if (document.getElementById('product-list')) { // Indikator bahwa ini adalah index.html
    fetchNews(); 
    initializeFavoriteButtons(); // Inisialisasi status tombol favorit di halaman produk

    document.querySelectorAll('.add-to-favorite').forEach(button => {
      button.addEventListener('click', async (event) => {
        const productId = event.currentTarget.dataset.productId;
        const productTitle = event.currentTarget.dataset.productTitle;
        const productImage = event.currentTarget.dataset.productImage;
        const productDescription = event.currentTarget.dataset.productDescription;

        const product = {
          id: productId,
          title: productTitle,
          image: productImage,
          description: productDescription,
          link: `detail.html?id=${productId}`
        };

        const isFav = await isFavorite(productId);
        if (isFav) {
          await removeFavorite(productId);
        } else {
          await addOrUpdateFavorite(product);
        }
        updateFavoriteButtonState(productId); // Perbarui tampilan tombol
      });
    });
  }

  // Logika untuk halaman favorites.html
  if (document.getElementById('favorites-container')) { // Indikator bahwa ini adalah favorites.html
    displayFavorites(); // Tampilkan favorit di halaman favorit
  }
});

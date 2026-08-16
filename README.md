# Kasir Pro — POS Firebase + GitHub Pages

Aplikasi kasir/POS berbasis **HTML5, CSS3, dan JavaScript Vanilla**. Tidak memerlukan Node.js, React, Vue, PHP, atau build process. Firebase digunakan untuk Authentication, Cloud Firestore, dan Storage. Aplikasi dapat dipublikasikan langsung melalui GitHub Pages.

## Fitur yang sudah tersedia

- Login Email/Password Firebase, reset password, session, role `admin` / `kasir`, status akun aktif/nonaktif.
- Dashboard penjualan, transaksi, keuntungan, stok, pelanggan, grafik, produk terlaris, transaksi terbaru.
- POS: pencarian nama/SKU/barcode, kategori, keranjang, quantity, diskon nominal/persen, pajak, pelanggan, pembayaran Tunai/QRIS/Transfer/Debit/Kredit/E-Wallet.
- Scanner barcode memakai `navigator.mediaDevices.getUserMedia()` dan decoder ZXing. Prioritas kamera belakang, switch camera, flash/torch bila didukung, anti double-scan, beep.
- Penyelesaian transaksi memakai Firestore Transaction: verifikasi stok live, pengurangan stok, counter nomor transaksi, sale snapshot, stock movement, poin pelanggan.
- Struk 58/80 mm dan CSS Print.
- CRUD produk + barcode unik + gambar Firebase Storage, kategori, pelanggan, supplier.
- Stok masuk, penyesuaian stok, history stok.
- Pembelian/restock supplier yang menambah stok otomatis.
- Riwayat transaksi, detail, CSV, cetak ulang, pembatalan/retur oleh admin tanpa menghapus sale asli.
- Shift kasir buka/tutup dan selisih kas.
- Laporan omzet/modal/keuntungan/transaksi/produk terjual/rata-rata/stok + CSV/print.
- User role/status management, Audit Log, Pengaturan toko, data demo.
- Dark mode, responsive mobile, bottom navigation, status online/offline, PWA shell caching.
- Shortcut: `F2` search, `F4` bayar, `F8` scanner, `Esc` tutup modal.

## Struktur project

```text
kasir-pos/
├── index.html
├── css/style.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── app.js
│   ├── data.js
│   ├── dashboard.js
│   ├── pos.js
│   ├── scanner.js
│   ├── products.js
│   ├── categories.js
│   ├── contacts.js
│   ├── inventory.js
│   ├── purchases.js
│   ├── transactions.js
│   ├── shifts.js
│   ├── reports.js
│   ├── users.js
│   ├── settings.js
│   ├── audit.js
│   └── utils.js
├── assets/logo/icon.svg
├── manifest.json
├── service-worker.js
├── firestore.rules
├── storage.rules
├── firestore.indexes.json
├── .nojekyll
└── README.md
```

## 1. Membuat Firebase Project

1. Buka Firebase Console: https://console.firebase.google.com/
2. Klik **Create a project**.
3. Setelah project dibuat, buka **Project settings** → bagian **Your apps** → pilih ikon Web `</>`.
4. Daftarkan Web App dan salin `firebaseConfig`.
5. Buka `js/firebase-config.js` lalu ganti semua nilai `ISI_...` dengan konfigurasi project Anda.

Aplikasi ini memakai Firebase JavaScript SDK melalui CDN ES Modules, sehingga tidak perlu `npm install` atau Node.js.

## 2. Authentication

1. Firebase Console → **Authentication** → **Sign-in method**.
2. Aktifkan **Email/Password**.
3. Buka tab **Users** → **Add user**.
4. Buat akun admin pertama.
5. Salin UID user tersebut.

### Authorized domain GitHub Pages

Di Firebase Authentication settings/authorized domains, tambahkan domain GitHub Pages bila belum tersedia:

```text
username.github.io
```

Yang dimasukkan adalah **domain**, bukan seluruh URL repository. Contoh URL aplikasi tetap dapat berupa:

```text
https://username.github.io/kasir-pos/
```

## 3. Membuat Admin Pertama di Firestore

1. Firebase Console → **Firestore Database** → Create database.
2. Buat collection: `users`.
3. Buat document dengan **Document ID = UID akun admin dari Authentication**.
4. Isi field:

```text
name   : Administrator     (string)
email  : admin@email.com   (string)
role   : admin             (string)
active : true              (boolean)
```

Jangan membuat tombol publik “Daftar sebagai Admin”. Password tidak boleh disimpan di Firestore.

## 4. Firestore collections

Aplikasi akan memakai collection berikut:

```text
users
products
categories
customers
suppliers
sales
purchases
stockMovements
shifts
settings
settings/store
counters
auditLogs
```

Setiap `sales` menyimpan snapshot item (`productId`, `name`, `barcode`, `qty`, `costPrice`, `sellingPrice`, `subtotal`) sehingga riwayat lama tidak ikut berubah saat master produk diedit.

## 5. Memasang Firestore Security Rules

Firebase Console → Firestore Database → **Rules** → salin isi `firestore.rules` → **Publish**.

Aturan project ini tidak memakai `allow read, write: if true`. Role diverifikasi dari `users/{request.auth.uid}` di server-side Rules, bukan dipercaya dari localStorage/JavaScript.

Kasir diizinkan mengurangi field stok produk saja ketika transaksi. Admin memiliki akses manajemen yang lebih luas. Dokumen sale tidak dapat dihapus oleh client; retur/pembatalan mengubah status audit.

Jika memakai Firebase CLI, file rules dapat dideploy melalui konfigurasi `firebase.json`, tetapi **CLI tidak diperlukan** jika Anda menyalin rules lewat Firebase Console.

## 6. Storage

Firebase Console → **Storage** → Get started. Setelah bucket dibuat:

1. Buka tab **Rules**.
2. Salin isi `storage.rules`.
3. Publish.

Rules membatasi upload gambar ke user admin, tipe `image/*`, maksimum 3 MB. Karena Storage Rules membaca role dari Firestore, Firebase mungkin meminta Anda mengaktifkan permission penghubung Storage Rules ↔ Firestore saat rules pertama kali disimpan.

## 7. Data Demo

Setelah admin berhasil login:

**Pengaturan → Data Demo → Tambahkan Data Demo**

Produk contoh:

- Indomie Goreng — barcode `089686010016`
- Aqua 600ml — barcode `8992752111014`

Data demo mempunyai `isDemo: true` agar mudah dikenali.

## 8. Scanner Kamera

Scanner menggunakan langsung:

```js
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: 'environment' } },
  audio: false
})
```

Stream kamera tersebut diberikan ke ZXing hanya untuk proses decoding barcode. Jadi akses kamera tetap berasal dari `getUserMedia()`.

Kamera browser membutuhkan secure context. Gunakan GitHub Pages HTTPS, bukan membuka `index.html` lewat `file://` jika ingin scanner bekerja konsisten.

Jika scanner tidak bekerja:

- Pastikan browser diberi izin Camera.
- Pastikan URL menggunakan `https://`.
- Coba Chrome/Edge Android atau Safari iOS terbaru.
- Pastikan tidak ada aplikasi lain yang sedang mengunci kamera.
- Pada iPhone, tombol flash dapat tidak muncul jika browser/perangkat tidak mengekspos capability `torch`.

## 9. Deploy ke GitHub Pages

1. Buat repository baru, misalnya `kasir-pos`.
2. Upload **isi folder project** ini ke branch `main`.
3. Repository → **Settings**.
4. Sidebar → **Pages**.
5. **Build and deployment → Source → Deploy from a branch**.
6. Branch: `main`.
7. Folder: `/(root)`.
8. Klik **Save**.
9. Setelah deployment berhasil, URL umumnya:

```text
https://USERNAME.github.io/kasir-pos/
```

Semua path aplikasi menggunakan path relatif (`./`) agar tetap bekerja di subfolder repository GitHub Pages.

## 10. Menambahkan akun Kasir

1. Firebase Authentication → Users → **Add user**.
2. Buat email/password kasir, salin UID.
3. Firestore → `users` → Add document dengan ID = UID tersebut.
4. Isi:

```text
name   : Nama Kasir
email  : kasir@email.com
role   : kasir
active : true
```

Menu kasir otomatis lebih terbatas daripada admin.

## 11. Nomor Transaksi

Format:

```text
TRX-YYYYMMDD-0001
```

Counter `counters/sales_YYYYMMDD` dinaikkan di Firestore Transaction yang sama dengan penyimpanan sale dan pengurangan stok, sehingga tidak memakai pola tidak aman `jumlahTransaksi + 1`.

## 12. Perilaku Offline

Aplikasi memberi indikator Online/Offline. Project ini **tidak menjanjikan transaksi berhasil saat benar-benar offline** karena penyelesaian transaksi memakai Firestore Transaction dan Firestore transaction membutuhkan koneksi server. Keranjang tetap ada di state halaman, tetapi tombol transaksi harus dicoba kembali setelah koneksi kembali.

Service worker hanya menyimpan shell/static file aplikasi dari origin GitHub Pages. Data Auth/Firestore sensitif tidak disalin manual ke Cache Storage oleh project ini.

## 13. Troubleshooting

### `auth/invalid-credential`
Email/password salah, akun belum dibuat, atau metode Email/Password belum aktif.

### `auth/unauthorized-domain`
Tambahkan `username.github.io` ke authorized domains Firebase Authentication.

### `Missing or insufficient permissions` / `Permission denied`
- Pastikan document `users/{UID}` tersedia.
- Pastikan `role` tepat `admin` atau `kasir`.
- Pastikan `active: true` berupa Boolean, bukan string.
- Pastikan `firestore.rules` terbaru sudah dipublish.

### `Camera permission denied` / `NotAllowedError`
Izinkan Camera pada browser/site settings dan gunakan HTTPS.

### `NotFoundError`
Browser tidak menemukan kamera yang cocok. Coba perangkat lain atau periksa permission/perangkat kamera.

### `getUserMedia is not defined`
Biasanya browser terlalu lama atau halaman tidak dijalankan dalam secure context. GitHub Pages menyediakan HTTPS.

### Firebase configuration error
Periksa `js/firebase-config.js`; jangan meninggalkan `ISI_API_KEY`, `ISI_PROJECT_ID`, dan placeholder lain.

### Storage upload ditolak
Pastikan Storage dibuat, rules dipublish, user role admin, gambar <3 MB, dan permission integrasi Firestore untuk Storage Rules sudah diaktifkan bila diminta Firebase.

### Composite index
Jika Firestore menampilkan error query yang memerlukan index, klik link pembuatan index yang diberikan error Firebase atau gunakan `firestore.indexes.json` sebagai referensi. Beberapa halaman juga memiliki fallback sorting client-side untuk database kecil.

## 14. Keamanan penting

- Firebase Web `apiKey`/config **bukan password server rahasia**. Konfigurasi itu memang berada di frontend web.
- Keamanan database harus bertumpu pada Firebase Authentication + Firestore/Storage Security Rules.
- Password tidak disimpan di localStorage atau Firestore.
- Role tidak dipercaya dari localStorage.
- Data user dirender memakai escaping/text yang aman pada bagian yang menerima input bebas.
- Firestore Rules adalah lapisan keamanan utama; menyembunyikan menu admin di JavaScript saja tidak cukup.

## 15. Checklist pengujian

- [ ] Firebase config sudah diganti
- [ ] Email/Password Authentication aktif
- [ ] Admin pertama ada di Authentication
- [ ] `users/{UID_ADMIN}` ada dan `role: admin`, `active: true`
- [ ] Firestore Rules sudah dipublish
- [ ] Storage Rules sudah dipublish
- [ ] Login admin berhasil
- [ ] Login kasir berhasil
- [ ] Role admin bekerja
- [ ] Role kasir bekerja
- [ ] Tambah produk berhasil
- [ ] Edit produk berhasil
- [ ] Hapus produk berhasil
- [ ] Barcode unik tervalidasi
- [ ] Scanner membuka kamera
- [ ] Kamera belakang diprioritaskan
- [ ] Barcode terbaca
- [ ] Produk masuk keranjang
- [ ] Quantity berubah dan tidak melebihi stok
- [ ] Diskon/pajak/total benar
- [ ] Pembayaran tunai dan kembalian benar
- [ ] Transaksi tersimpan ke Firestore
- [ ] Stok berkurang atomik
- [ ] Stock movement tercatat
- [ ] Struk 58/80 mm dapat dicetak
- [ ] Dashboard diperbarui
- [ ] Laporan muncul
- [ ] Shift kasir bekerja
- [ ] Retur/pembatalan mengembalikan stok
- [ ] Logout berhasil
- [ ] GitHub Pages terbuka dari HP
- [ ] Kamera dapat diakses dari GitHub Pages HTTPS

## Referensi resmi

- Firebase Web setup: https://firebase.google.com/docs/web/alt-setup
- Firebase Auth Web: https://firebase.google.com/docs/auth/web/start
- Firestore transactions: https://firebase.google.com/docs/firestore/manage-data/transactions
- Storage Security Rules: https://firebase.google.com/docs/storage/security/rules-conditions
- GitHub Pages publishing: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

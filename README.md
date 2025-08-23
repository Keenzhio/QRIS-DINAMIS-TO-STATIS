🚀 QRIS Converter — Dynamic ➜ Static

Aplikasi React untuk mengonversi QRIS Dinamis menjadi QRIS Statis dengan nominal yang bisa diinput user.


---

📦 Fitur

Upload QRIS dinamis (gambar PNG/JPG).

Decode payload QR menggunakan jsQR.

Input nominal manual.

Generate QRIS statis (pakai qrcode) dengan tag 54 (Amount).

Hitung ulang CRC16 (tag 63) untuk menjaga validitas payload.

Download hasil QRIS statis (PNG).

Semua berjalan di browser (client-side only).



---

📂 Struktur Project

qris-converter/
├── package.json
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   ├── QrisConverter.jsx
│   └── index.css


---

⚡ Cara Menjalankan (Local)

1. Clone repo atau download source code:

git clone https://github.com/username/qris-converter.git
cd qris-converter


2. Install dependencies:

npm install


3. Jalankan lokal (dev server):

npm start

App akan terbuka di http://localhost:3000


4. Build untuk production:

npm run build

Hasil build ada di folder /build.




---

🌐 Deploy ke Vercel

1. Push project ke GitHub.


2. Masuk ke Vercel → Import Project dari GitHub.


3. Vercel otomatis mendeteksi React → build & deploy.


4. Selesai, app bisa diakses di domain gratis https://project-name.vercel.app.




---

⚠️ Catatan Penting

Implementasi EMV/QRIS masih eksperimental (hanya simulasi client-side).

QRIS production membutuhkan validasi compliance resmi dari penyelenggara pembayaran.

Jangan gunakan langsung untuk transaksi riil tanpa sertifikasi.



---

📜 Lisensi

MIT License © 2025


# Novel Luxurry 📚

**Novel Luxurry** adalah sebuah platform *e-commerce* dan katalog buku digital komprehensif yang dikembangkan menggunakan ekosistem **Next.js** dan **Prisma ORM**. Sistem ini dirancang untuk memberikan pengalaman eksplorasi literatur dan transaksi belanja yang responsif, terstruktur, dan ramah pengguna (*user-friendly*).

---

## 🔐 Kredensial Akses Sistem (Demo Akun)

Untuk keperluan pengujian dan peninjauan fitur aplikasi, silakan gunakan kredensial akun berikut:

| Peran (*Role*) | Alamat Email | Kata Sandi (*Password*) | Tingkat Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@noveluxe.com` | `admin123` | Hak akses penuh (Dasbor Sistem & Manajemen Konten) |
| **Pengguna (*User*)** | `kaka@gmail.com` | `kaka1234` | Antarmuka publik, Keranjang Belanja, & Proses Transaksi |

---

## 📋 Standar Operasional Prosedur (SOP) Penggunaan

### 1. Entitas Pengguna Publik (*User*)
Pengguna biasa memiliki hak akses pada antarmuka publik (*front-end*) dengan rincian operasional sebagai berikut:
* **Eksplorasi & Pencarian Katalog:** Pengguna dapat menavigasi halaman utama, mencari literatur berdasarkan judul, serta menggunakan fitur filter kategori untuk menemukan buku secara spesifik.
* **Manajemen Keranjang Belanja (*Cart*):** Pengguna dapat menambahkan produk ke dalam keranjang, menyesuaikan kuantitas pesanan, serta meninjau rincian estimasi biaya sebelum melanjutkan ke tahap pembayaran.
* **Proses Transaksi (*Checkout*):** Pengguna dapat mengonfirmasi dan menyelesaikan proses pembelian produk melalui alur *checkout* yang sistematis.
* **Sistem Ulasan & Testimoni:** Pengguna memiliki akses untuk memberikan umpan balik dan membagikan ulasan pengalaman penggunaan platform.

### 2. Entitas Administrator (*Admin*)
Administrator bertindak sebagai pengelola sistem (*back-office*) dengan hak prerogatif untuk mengontrol aliran data utama aplikasi:
* **Akses Dasbor Administrator:** Administrator diwajibkan melakukan autentikasi sistem untuk dapat mengakses panel kontrol khusus melalui rute `/admin`.
* **Manajemen Inventaris (*CRUD* Buku):** Administrator memiliki kewenangan penuh untuk mengelola pangkalan data buku. Ini mencakup penambahan (*Create*), pembacaan (*Read*), pembaruan data seperti harga atau sampul (*Update*), hingga penghapusan literatur (*Delete*).
* **Pengelolaan Kategori Produk:** Administrator bertanggung jawab untuk menyusun dan mengelola taksonomi/kategori buku guna mengoptimalkan alur navigasi aplikasi.
* **Moderasi Konten & Ulasan:** Administrator bertugas meninjau dan memvalidasi testimoni atau ulasan yang dikirimkan oleh pengguna sebelum informasi tersebut ditampilkan secara publik.

---

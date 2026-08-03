# 🔀 Gerbang API Lampung Utara

> **Dashboard & Management System untuk Data Terbuka Pemerintah Kabupaten Lampung Utara**

Gerbang API Lampung Utara merupakan portal open data berbasis API. Sistem ini dirancang untuk memfasilitasi pertukaran data antar instansi (OPD) secara publik. Tidak ada lagi sistem perizinan (Access Control) yang rumit; semua data yang diunggah dipublikasikan secara langsung agar dapat digunakan oleh OPD lain.

Repositori ini menggunakan arsitektur **Decoupled Monorepo**:
- **Backend:** Laravel 11 (RESTful API Gateway)
- **Frontend:** React + Vite (Single Page Application UI)

---

## 🏗️ Struktur Repositori

```
Gerbang-API-Lampung-Utara-Dasboard/
│
├── backend/                # 🔧 Laravel 11 — RESTful API Gateway
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/         # Schema utama: Opd, Endpoint, RequestLog, User
│   │   └── Middleware/
│   ├── routes/
│   ├── .env.example        
│   └── artisan
│
├── frontend/               # 🎨 React + Vite UI Dashboard
│   ├── src/
│   │   ├── components/     # UI reusable, layout (Sidebar, Header)
│   │   ├── context/        # State Management (Auth, Theme, ApiGateway)
│   │   ├── pages/          # Halaman admin & dashboard OPD
│   │   └── services/       # Konfigurasi axios (api.js)
│   └── package.json        
│
└── README.md               # File ini
```

---

## 🔧 Backend (Laravel API)

### Persyaratan
- PHP 8.2+
- Composer 2+
- Node.js & npm (untuk frontend)

### Instalasi Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

API akan berjalan di: **http://localhost:8000**

### Struktur Database Terkini

| Tabel             | Deskripsi                                         |
|-------------------|---------------------------------------------------|
| `opds`            | Data Instansi Pemilik Data (OPD)                  |
| `endpoints`       | Daftar layanan API / dataset milik OPD            |
| `users`           | Akun admin monitoring & akun instansi/OPD         |
| `request_logs`    | Catatan lalu lintas data / hit gateway            |

*(Catatan: Sistem Token API, Application, dan Access Control telah dihentikan karena seluruh data gateway sekarang bersifat **Publik**).*

---

## 🎨 Frontend (React + Vite)

Frontend dibangun dengan React (Vite), menggunakan Tailwind CSS untuk styling dan Lucide React untuk ikon. 

### Instalasi Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi UI berjalan di: **http://localhost:5173**

---

## 🚀 Fitur Utama

1. **Portal Publik (Bebas Token):**
   Seluruh dataset/API yang terdaftar dapat diakses bebas tanpa perlu token/API Key.
2. **Katalog API (Open Data):**
   OPD dapat mencari dan menggunakan API dari instansi lain secara transparan.
3. **Manajemen Dataset OPD:**
   Setiap OPD memiliki akun masing-masing untuk mengelola dan mempublikasikan API/Dataset.
4. **Monitoring Terpusat:**
   Dinas Kominfo memiliki akses khusus (Admin Super) untuk melihat seluruh log interaksi dan mengatur kredensial OPD.

---

## 📋 Lisensi

Proyek ini dikembangkan sebagai bagian dari program Kerja Praktik (KP) untuk keperluan internal pemerintahan.

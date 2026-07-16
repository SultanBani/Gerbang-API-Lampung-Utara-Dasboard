# 🔀 Gerbang API Lampung Utara

> **Dashboard & Management System untuk API Gateway Pemerintah Kabupaten Lampung Utara**

Repositori ini menggunakan arsitektur **Decoupled Monorepo** — backend dan frontend dikerjakan dalam satu repository namun terpisah secara deployment.

---

## 🏗️ Struktur Repositori

```
Gerbang-API-Lampung-Utara-Dasboard/
│
├── backend/                # 🔧 Laravel 13 — RESTful API Gateway
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   └── migrations/     # Schema: applications, endpoints, api_keys, access_controls, request_logs
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── artisan
│   ├── composer.json
│   └── .env.example        # Konfigurasi environment backend
│
├── frontend/               # 🎨 Framework UI (belum diinisiasi)
│   └── README.md           # Panduan instalasi framework
│
├── _old_monolith_archive/  # 📦 Arsip kode monolith lama (referensi)
│   ├── resources/views/    # Blade templates lama
│   └── public/             # Static assets lama
│
├── .gitignore              # Ignore rules untuk backend/ dan frontend/
└── README.md               # File ini
```

---

## 🔧 Backend (Laravel API)

### Persyaratan
- PHP 8.3+
- Composer 2+

### Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment
cp .env.example .env

# Generate app key
php artisan key:generate

# Jalankan migrasi database
php artisan migrate

# Jalankan server development
php artisan serve
```

API akan berjalan di: **http://localhost:8000**

### Struktur Database

| Tabel             | Deskripsi                                         |
|-------------------|---------------------------------------------------|
| `applications`    | Aplikasi klien OPD yang terdaftar                 |
| `endpoints`       | Daftar endpoint API yang dikelola gateway         |
| `api_keys`        | Kunci API unik per aplikasi (dengan expiry)        |
| `access_controls` | Hak akses antar aplikasi dan endpoint             |
| `request_logs`    | Log seluruh request yang masuk ke gateway         |

---

## 🎨 Frontend (UI Dashboard)

> 🚧 **Belum diinisiasi.** Lihat [`frontend/README.md`](./frontend/README.md) untuk panduan instalasi.

---

## 🌿 Git Branching Strategy

| Branch     | Scope Pekerjaan                                                      |
|------------|----------------------------------------------------------------------|
| `main`     | Integrasi, dokumentasi root, konfigurasi monorepo                    |
| `backend`  | Migrations, Models, API Controllers, Middleware, API Routes          |
| `frontend` | Inisiasi framework UI, komponen, halaman, state management           |

```bash
# Mulai pengerjaan backend
git checkout backend

# Mulai pengerjaan frontend
git checkout frontend

# Merge ke main setelah fitur selesai
git checkout main
git merge backend  # atau frontend
```

---

## 📦 Arsip Monolith Lama

Kode Blade UI dari versi monolith tersimpan di [`_old_monolith_archive/`](./_old_monolith_archive/) sebagai referensi. Folder ini **tidak akan dideploy** dan hanya untuk keperluan migrasi logika UI ke framework baru.

---

## 📋 Lisensi

Proyek ini dikembangkan sebagai bagian dari program Kerja Praktik (KP) untuk keperluan internal pemerintahan.

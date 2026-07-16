# Frontend — Gerbang API Lampung Utara

> 📌 Folder ini adalah tempat inisiasi framework UI untuk Dashboard Gerbang API Lampung Utara.

## Status
**🚧 Belum diinisiasi.** Menunggu keputusan framework frontend.

## Pilihan Framework
- [ ] **React + Vite** — SPA modern, ekosistem terbesar
- [ ] **Vue 3 + Vite** — Sintaks mirip Blade, transisi mudah  
- [ ] **Nuxt.js** — Vue + SSR, optimal untuk SEO

## Cara Inisiasi (setelah framework dipilih)

### React (Vite)
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

### Vue 3 (Vite)
```bash
cd frontend
npm create vite@latest . -- --template vue-ts
npm install
npm run dev
```

### Nuxt.js
```bash
cd frontend
npx nuxi@latest init .
npm install
npm run dev
```

## Koneksi ke Backend

Backend API berjalan di: `http://localhost:8000/api/v1`

Konfigurasi base URL di file `.env` frontend:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Referensi
- Backend API: [`../backend/`](../backend/)
- Dokumentasi API: *(akan ditambahkan setelah API routes selesai dibuat)*

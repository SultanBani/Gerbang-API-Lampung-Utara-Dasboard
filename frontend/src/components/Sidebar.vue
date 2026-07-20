<template>
  <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 transition-colors duration-300 shadow-sm">
    <div>
      <!-- Brand Logo Header -->
      <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/25">
          🔗
        </div>
        <div>
          <h1 class="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-none">Gerbang API</h1>
          <span class="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 tracking-widest uppercase block mt-1">Diskominfo Lampung Utara</span>
        </div>
      </div>

      <!-- Navigation Menu Groups -->
      <nav class="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
        <div>
          <span class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Utama</span>
          <router-link
            to="/dashboard"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/dashboard' }"
          >
            <span class="text-sm w-5 text-center">📊</span>
            <span>Dashboard</span>
          </router-link>
          <router-link
            to="/aplikasi"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/aplikasi' }"
          >
            <span class="text-sm w-5 text-center">🗂️</span>
            <span>Aplikasi Terdaftar</span>
            <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{{ store.applications.length }}</span>
          </router-link>
        </div>

        <div>
          <span class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Manajemen API</span>
          <router-link
            to="/endpoints"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/endpoints' }"
          >
            <span class="text-sm w-5 text-center">⚙️</span>
            <span>Endpoint API</span>
            <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">{{ store.endpoints.length }}</span>
          </router-link>
          <router-link
            to="/hak-akses"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/hak-akses' }"
          >
            <span class="text-sm w-5 text-center">🔐</span>
            <span>Hak Akses API</span>
          </router-link>
          <router-link
            to="/api-keys"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/api-keys' }"
          >
            <span class="text-sm w-5 text-center">🗝️</span>
            <span>Token / API Key</span>
          </router-link>
        </div>

        <div>
          <span class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Monitoring</span>
          <router-link
            to="/logs"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/logs' }"
          >
            <span class="text-sm w-5 text-center">📋</span>
            <span>Log Request</span>
            <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">Live</span>
          </router-link>
        </div>

        <div>
          <span class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2">Developer</span>
          <router-link
            to="/tester"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/tester' }"
          >
            <span class="text-sm w-5 text-center">🧪</span>
            <span>API Tester</span>
          </router-link>
          <router-link
            to="/dokumentasi"
            class="nav-link"
            :class="{ 'active-link': $route.path === '/dokumentasi' }"
          >
            <span class="text-sm w-5 text-center">📖</span>
            <span>Dokumentasi API</span>
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Admin Profile Footer -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 backdrop-blur flex items-center justify-between transition-colors">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-xs text-white shadow">
            AD
          </div>
          <span class="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
        </div>
        <div class="leading-tight">
          <p class="text-xs font-extrabold text-slate-900 dark:text-slate-200">Admin Diskominfo</p>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Super Administrator</span>
        </div>
      </div>
      <button title="Keluar" class="text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
        🚪
      </button>
    </div>
  </aside>
</template>

<script setup>
import { store } from '../store/apiGatewayStore.js'
</script>

<style scoped>
@reference "../style.css";

.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 mb-1 relative;
}
.active-link {
  @apply bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border-l-2 border-blue-600 dark:border-blue-500 pl-3 shadow-sm;
}
</style>

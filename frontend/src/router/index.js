import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import AplikasiView from '../views/AplikasiView.vue'
import EndpointView from '../views/EndpointView.vue'
import HakAksesView from '../views/HakAksesView.vue'
import ApiKeyView from '../views/ApiKeyView.vue'
import LogRequestView from '../views/LogRequestView.vue'
import ApiTesterView from '../views/ApiTesterView.vue'
import DokumentasiView from '../views/DokumentasiView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/aplikasi', name: 'Aplikasi Terdaftar', component: AplikasiView },
  { path: '/endpoints', name: 'Manajemen Endpoint API', component: EndpointView },
  { path: '/hak-akses', name: 'Hak Akses API', component: HakAksesView },
  { path: '/api-keys', name: 'Token / API Key', component: ApiKeyView },
  { path: '/logs', name: 'Log Request', component: LogRequestView },
  { path: '/tester', name: 'API Tester', component: ApiTesterView },
  { path: '/dokumentasi', name: 'Dokumentasi API', component: DokumentasiView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

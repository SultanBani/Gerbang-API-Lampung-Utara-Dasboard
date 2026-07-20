<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
     <?php $__env->slot('header', null, []); ?> 
        <h2 class="font-bold text-lg text-slate-100 tracking-tight leading-none">
            <?php echo e(__('Dashboard')); ?>

        </h2>
     <?php $__env->endSlot(); ?>

    <!-- STATS CARDS GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <!-- Card 1: Aplikasi -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg mb-4">🗂️</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1"><?php echo e($appsCount ?? 8); ?></p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Aplikasi Terdaftar</span>
            <span class="text-[10px] text-emerald-400 font-bold block mt-2">↑ 2 bulan ini</span>
        </div>

        <!-- Card 2: Endpoints -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg mb-4">⚙️</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1"><?php echo e($endpointsCount ?? 24); ?></p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Endpoint</span>
            <span class="text-[10px] text-emerald-400 font-bold block mt-2">↑ 5 baru didaftarkan</span>
        </div>

        <!-- Card 3: API Key Aktif -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg mb-4">🗝️</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1"><?php echo e($activeKeysCount ?? 8); ?></p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">API Key Aktif</span>
            <span class="text-[10px] text-slate-400 font-bold block mt-2">Semua berjalan normal</span>
        </div>

        <!-- Card 4: Request Hari Ini -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg mb-4">📥</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1"><?php echo e($requestsTodayCount ?? '4,821'); ?></p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Request Hari Ini</span>
            <span class="text-[10px] text-emerald-400 font-bold block mt-2">↑ 12% dari kemarin</span>
        </div>

        <!-- Card 5: Request Gagal -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-lg mb-4">⚠️</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1"><?php echo e($failedRequestsTodayCount ?? 37); ?></p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Request Gagal</span>
            <span class="text-[10px] text-red-400 font-bold block mt-2">↑ 8 error terdeteksi</span>
        </div>

        <!-- Card 6: Uptime Gateway -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
            <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-300"></div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg mb-4">⚡</div>
            <p class="text-3xl font-extrabold text-slate-100 leading-none mb-1">98.4%</p>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Uptime Gateway</span>
            <span class="text-[10px] text-emerald-400 font-bold block mt-2">Sangat Stabil</span>
        </div>
    </div>

    <!-- CHARTS SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
            <h3 class="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
                <span>📈</span> Volume Request 7 Hari Terakhir
            </h3>
            <div class="h-64">
                <canvas id="chart-request" class="w-full h-full"></canvas>
            </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 class="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
                <span>🍩</span> Status Response HTTP
            </h3>
            <div class="h-64 flex items-center justify-center">
                <canvas id="chart-status" class="w-full h-full"></canvas>
            </div>
        </div>
    </div>

    <!-- LOG & RECOMMENDATION TWO-COLUMN -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Logs Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 class="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
                <span>📋</span> Log Request Terbaru
            </h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                            <th class="pb-3">Waktu</th>
                            <th class="pb-3">Aplikasi</th>
                            <th class="pb-3">Endpoint</th>
                            <th class="pb-3 text-center">Status</th>
                            <th class="pb-3 text-right">R. Time</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        <?php $__empty_1 = true; $__currentLoopData = $recentLogs ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $log): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3"><?php echo e($log->created_at->format('H:i:s')); ?></td>
                                <td class="py-3 font-semibold text-slate-200"><?php echo e($log->application->name ?? 'Unknown'); ?></td>
                                <td class="py-3 font-mono text-slate-400"><code><?php echo e($log->method); ?> <?php echo e($log->url); ?></code></td>
                                <td class="py-3 text-center">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold <?php echo e($log->status_code >= 400 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'); ?>">
                                        <?php echo e($log->status_code); ?>

                                    </span>
                                </td>
                                <td class="py-3 text-right text-slate-400 font-mono"><?php echo e($log->response_time_ms); ?>ms</td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                            <!-- Fallback Mock Rows for visual demonstration if database is empty -->
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3">11:38:02</td>
                                <td class="py-3 font-semibold text-slate-200">SIMPEG</td>
                                <td class="py-3 font-mono text-slate-400"><code>GET /api/pegawai</code></td>
                                <td class="py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">200</span></td>
                                <td class="py-3 text-right text-slate-400 font-mono">87ms</td>
                            </tr>
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3">11:37:55</td>
                                <td class="py-3 font-semibold text-slate-200">E-Office</td>
                                <td class="py-3 font-mono text-slate-400"><code>GET /api/pegawai</code></td>
                                <td class="py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">200</span></td>
                                <td class="py-3 text-right text-slate-400 font-mono">102ms</td>
                            </tr>
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3">11:37:30</td>
                                <td class="py-3 font-semibold text-slate-200">SIPD</td>
                                <td class="py-3 font-mono text-slate-400"><code>POST /api/auth/login</code></td>
                                <td class="py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">200</span></td>
                                <td class="py-3 text-right text-slate-400 font-mono">210ms</td>
                            </tr>
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3">11:37:01</td>
                                <td class="py-3 font-semibold text-slate-200">Absensi</td>
                                <td class="py-3 font-mono text-slate-400"><code>DELETE /api/pegawai/5</code></td>
                                <td class="py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">403</span></td>
                                <td class="py-3 text-right text-slate-400 font-mono">45ms</td>
                            </tr>
                            <tr class="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td class="py-3">11:36:44</td>
                                <td class="py-3 font-semibold text-slate-200">PPDB</td>
                                <td class="py-3 font-mono text-slate-400"><code>GET /api/siswa</code></td>
                                <td class="py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">401</span></td>
                                <td class="py-3 text-right text-slate-400 font-mono">31ms</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- AI Advisor Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
                <h3 class="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
                    <span>💡</span> Analisis Keamanan & Efisiensi
                </h3>

                <!-- AI Advisor Hook Widget -->
                <div class="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 mb-4">
                    <div class="flex items-center gap-2 text-amber-400 font-bold text-xs mb-3">
                        <span>🤖</span> AI Security Advisor
                    </div>
                    <div class="space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p class="flex items-start gap-2">
                            <span class="text-amber-500">•</span>
                            <span>Endpoint <code class="bg-slate-800 px-1 py-0.5 rounded text-amber-300">POST /api/auth/login</code> belum memiliki Rate Limit yang dikonfigurasi.</span>
                        </p>
                        <p class="flex items-start gap-2">
                            <span class="text-amber-500">•</span>
                            <span>Aplikasi <strong class="text-slate-200">PPDB</strong> menggunakan Token/API Key yang akan kedaluwarsa dalam 14 hari.</span>
                        </p>
                        <p class="flex items-start gap-2">
                            <span class="text-emerald-400">•</span>
                            <span>Saran: Rotasi berkala API Key aplikasi <strong class="text-slate-200">SIAK</strong> (belum pernah dirotasi selama 90+ hari).</span>
                        </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Status: Menunggu input integrasi AI (Modul Teman)</span>
                        <a href="#" class="text-blue-400 hover:underline">Pelajari lebih lanjut →</a>
                    </div>
                </div>
            </div>

            <!-- Top Apps Usage progress bar -->
            <div class="space-y-3 pt-4 border-t border-slate-800">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Penggunaan Traffic Terbesar</h4>
                <div class="space-y-2">
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-slate-300 font-medium">SIMPEG</span>
                            <span class="text-slate-400">1,840 req (82%)</span>
                        </div>
                        <div class="w-full bg-slate-800 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: 82%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-slate-300 font-medium">E-Office</span>
                            <span class="text-slate-400">1,203 req (60%)</span>
                        </div>
                        <div class="w-full bg-slate-800 rounded-full h-2">
                            <div class="bg-indigo-500 h-2 rounded-full" style="width: 60%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CHARTS INITIALIZATION -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Line Chart: Request Traffic
            const ctxRequest = document.getElementById('chart-request').getContext('2d');
            new Chart(ctxRequest, {
                type: 'line',
                data: {
                    labels: ['Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Senin', 'Selasa', 'Rabu'],
                    datasets: [{
                        label: 'Total Request',
                        data: [3200, 4100, 3800, 5200, 4600, 4200, 4821],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointRadius: 4,
                        borderWidth: 2
                    }, {
                        label: 'Request Gagal',
                        data: [45, 62, 38, 80, 52, 41, 37],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.02)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ef4444',
                        pointRadius: 4,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#94a3b8',
                                font: { family: 'Figtree', size: 11, weight: '500' }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#64748b', font: { family: 'Figtree', size: 10 } },
                            grid: { color: 'rgba(51, 65, 85, 0.2)' }
                        },
                        y: {
                            ticks: { color: '#64748b', font: { family: 'Figtree', size: 10 } },
                            grid: { color: 'rgba(51, 65, 85, 0.2)' }
                        }
                    }
                }
            });

            // Donut Chart: HTTP Statuses
            const ctxStatus = document.getElementById('chart-status').getContext('2d');
            new Chart(ctxStatus, {
                type: 'doughnut',
                data: {
                    labels: ['200 OK', '401 Unauthorized', '403 Forbidden', '500 Server Error'],
                    datasets: [{
                        data: [4621, 98, 65, 37],
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(99, 102, 241, 0.7)'
                        ],
                        borderColor: [
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#6366f1'
                        ],
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                font: { family: 'Figtree', size: 10, weight: '500' },
                                padding: 12
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        });
    </script>

 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH D:\SEMESTER 6\KP\GERBANG API\resources\views/dashboard.blade.php ENDPATH**/ ?>
<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title><?php echo e(config('app.name', 'Gerbang API')); ?> — Diskominfo Lampung Utara</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <!-- Scripts -->
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
    </head>
    <body class="font-sans antialiased bg-slate-950 text-slate-100 h-screen overflow-hidden flex">
        
        <!-- SIDEBAR -->
        <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
            <div>
                <!-- Brand logo -->
                <div class="p-6 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                            🔗
                        </div>
                        <div>
                            <h1 class="font-bold text-sm text-slate-100 tracking-tight leading-none">Gerbang API</h1>
                            <span class="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">Diskominfo Lampung Utara</span>
                        </div>
                    </div>
                </div>

                <!-- Navigation items -->
                <nav class="p-4 space-y-6">
                    <div>
                        <span class="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase block mb-2">Utama</span>
                        <a href="<?php echo e(route('dashboard')); ?>" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors <?php echo e(request()->routeIs('dashboard') ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-[10px]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'); ?>">
                            <span class="text-base w-5 text-center">📊</span> Dashboard
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100 mt-1">
                            <span class="text-base w-5 text-center">🗂️</span> Aplikasi Terdaftar
                        </a>
                    </div>

                    <div>
                        <span class="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase block mb-2">Manajemen API</span>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100">
                            <span class="text-base w-5 text-center">⚙️</span> Endpoint API
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100 mt-1">
                            <span class="text-base w-5 text-center">🔐</span> Hak Akses API
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100 mt-1">
                            <span class="text-base w-5 text-center">🗝️</span> Token / API Key
                        </a>
                    </div>

                    <div>
                        <span class="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase block mb-2">Monitoring</span>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100">
                            <span class="text-base w-5 text-center">📋</span> Log Request
                        </a>
                    </div>

                    <div>
                        <span class="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase block mb-2">Developer</span>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100">
                            <span class="text-base w-5 text-center">🧪</span> API Tester
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-100 mt-1">
                            <span class="text-base w-5 text-center">📖</span> Dokumentasi API
                        </a>
                    </div>
                </nav>
            </div>

            <!-- Profile and logout -->
            <div class="p-4 border-t border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-xs text-white">
                        <?php echo e(substr(Auth::user()->name, 0, 2)); ?>

                    </div>
                    <div class="leading-none">
                        <p class="text-xs font-semibold text-slate-200"><?php echo e(Auth::user()->name); ?></p>
                        <span class="text-[10px] text-slate-400">Admin</span>
                    </div>
                </div>
                <!-- Logout Button -->
                <form method="POST" action="<?php echo e(route('logout')); ?>">
                    <?php echo csrf_field(); ?>
                    <button type="submit" class="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-800" title="Keluar">
                        🚪
                    </button>
                </form>
            </div>
        </aside>

        <!-- MAIN LAYOUT -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- TOP HEADER -->
            <header class="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 flex-shrink-0">
                <div>
                    <?php if(isset($header)): ?>
                        <?php echo e($header); ?>

                    <?php else: ?>
                        <h2 class="font-bold text-base text-slate-100 tracking-tight">Dashboard</h2>
                    <?php endif; ?>
                </div>
                <div class="flex items-center gap-4">
                    <button class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors">
                        🔔 Notifikasi
                    </button>
                </div>
            </header>

            <!-- MAIN CONTENT PAGE -->
            <main class="flex-1 overflow-y-auto p-8">
                <?php echo e($slot); ?>

            </main>
        </div>

    </body>
</html>
<?php /**PATH D:\SEMESTER 6\KP\GERBANG API\resources\views/layouts/app.blade.php ENDPATH**/ ?>
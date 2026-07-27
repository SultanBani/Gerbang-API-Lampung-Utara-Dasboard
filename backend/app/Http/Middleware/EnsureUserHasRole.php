<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserHasRole — Cek role user yang login.
 *
 * Usage: ->middleware('role:admin')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Anda tidak memiliki akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}

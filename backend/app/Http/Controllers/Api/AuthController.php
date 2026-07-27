<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Handle Login Admin & Dinas (OPD)
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = $request->input('login');

        // Cari user berdasarkan email atau username
        $user = User::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->with('opd')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username/Email atau Password salah.',
            ], 401);
        }

        // Hapus semua token lama, buat token Sanctum baru
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil. Selamat datang di Gerbang API Kabupaten Lampung Utara.',
            'data' => [
                'token' => $token,
                'user'  => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'username'       => $user->username,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'opd_id'         => $user->opd_id,
                    'opd'            => $user->opd,
                ],
            ],
        ]);
    }

    /**
     * Get profile user aktif
     * GET /api/auth/me — protected by auth:sanctum
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user->load('opd');

        return response()->json([
            'success' => true,
            'data'    => [
                'id'             => $user->id,
                'name'           => $user->name,
                'username'       => $user->username,
                'email'          => $user->email,
                'role'           => $user->role,
                'opd_id'         => $user->opd_id,
                'opd'            => $user->opd,
            ],
        ]);
    }

    /**
     * Logout — hapus token aktif
     * POST /api/auth/logout — protected by auth:sanctum
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout.',
        ]);
    }
}

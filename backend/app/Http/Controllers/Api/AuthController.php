<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle Login Admin & Dinas (OPD)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = $request->input('login');

        // Mencari user berdasarkan Email atau Username
        $user = User::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->with('application.apiKeys')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username/Email atau Password salah.',
            ], 401);
        }

        // Generate token sederhana (session/bearer token)
        $token = Str::random(64);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil. Selamat datang di Gerbang API Kabupaten Lampung Utara.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'username'       => $user->username,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'opd_name'       => $user->opd_name,
                    'application_id' => $user->application_id,
                    'application'    => $user->application,
                ]
            ]
        ]);
    }

    /**
     * Get profile user aktif
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user->load('application.apiKeys');

        return response()->json([
            'success' => true,
            'data' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'username'       => $user->username,
                'email'          => $user->email,
                'role'           => $user->role,
                'opd_name'       => $user->opd_name,
                'application_id' => $user->application_id,
                'application'    => $user->application,
            ]
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout.',
        ]);
    }
}

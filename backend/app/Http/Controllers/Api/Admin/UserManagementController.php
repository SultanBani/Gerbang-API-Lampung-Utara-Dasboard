<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Opd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Tampilkan seluruh akun pengguna (Admin & OPD)
     */
    public function index()
    {
        $users = User::with('opd')->orderBy('role', 'asc')->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $users
        ]);
    }

    /**
     * Buat akun baru oleh Admin
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,opd',
            'opd_id'   => 'nullable|exists:opds,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        $user->load('opd');

        return response()->json([
            'success' => true,
            'message' => 'Akun pengguna berhasil dibuat.',
            'data'    => $user
        ], 201);
    }

    /**
     * Detail satu user
     */
    public function show(int $id)
    {
        $user = User::with('opd')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user
        ]);
    }

    /**
     * Update akun / Reset Password oleh Admin
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'username' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('users')->ignore($user->id)],
            'email'    => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role'     => 'sometimes|required|in:admin,opd',
            'opd_id'   => 'nullable|exists:opds,id',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        $user->load('opd');

        return response()->json([
            'success' => true,
            'message' => 'Akun pengguna berhasil diperbarui.',
            'data'    => $user
        ]);
    }

    /**
     * Hapus akun pengguna
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus satu-satunya akun Admin Super.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun pengguna berhasil dihapus.'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use App\Models\Endpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AccessRequestController extends Controller
{
    /**
     * Ambil seluruh permohonan hak akses untuk OPD yang sedang login:
     * - my_requests: Permohonan yang diajukan oleh OPD ini ke OPD lain.
     * - incoming_requests: Permohonan yang masuk dari OPD lain ke API milik OPD ini.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id && $user->role !== 'admin') {
            return response()->json([
                'success' => true,
                'data' => [
                    'my_requests' => [],
                    'incoming_requests' => [],
                ]
            ]);
        }

        // 1. My Requests (Permohonan yang diajukan OPD ini)
        $myRequests = AccessRequest::with(['endpoint.opd', 'requestorOpd'])
            ->where('requestor_opd_id', $user->opd_id)
            ->latest()
            ->get();

        // 2. Incoming Requests (Permohonan yang masuk untuk API milik OPD ini)
        if ($user->role === 'admin') {
            $incomingRequests = AccessRequest::with(['endpoint.opd', 'requestorOpd'])
                ->latest()
                ->get();
        } else {
            $incomingRequests = AccessRequest::with(['endpoint.opd', 'requestorOpd'])
                ->whereHas('endpoint', function ($q) use ($user) {
                    $q->where('opd_id', $user->opd_id);
                })
                ->latest()
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'my_requests'       => $myRequests,
                'incoming_requests' => $incomingRequests,
            ]
        ]);
    }

    /**
     * Ajukan Permohonan Hak Akses API Baru
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak terhubung ke OPD. Hanya akun OPD yang dapat mengajukan hak akses API.',
            ], 403);
        }

        $validated = $request->validate([
            'endpoint_id'       => 'required|exists:endpoints,id',
            'requested_methods' => 'nullable|array',
        ]);

        $endpoint = Endpoint::findOrFail($validated['endpoint_id']);

        // Cek apakah mencoba meminta akses ke API milik sendiri
        if ((int)$endpoint->opd_id === (int)$user->opd_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak perlu meminta hak akses ke API milik OPD Anda sendiri.',
            ], 422);
        }

        // Cek permohonan eksis
        $existing = AccessRequest::where('endpoint_id', $endpoint->id)
            ->where('requestor_opd_id', $user->opd_id)
            ->first();

        if ($existing) {
            if ($existing->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan hak akses untuk API ini sudah disetujui sebelumnya.',
                    'data'    => $existing,
                ], 422);
            }

            if ($existing->status === 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan hak akses untuk API ini sudah diajukan dan sedang menunggu persetujuan OPD pemilik.',
                    'data'    => $existing,
                ], 422);
            }

            // Jika sebelumnya rejected, update kembali ke pending
            $existing->update([
                'status'            => 'pending',
                'requested_methods' => $validated['requested_methods'] ?? ['GET'],
                'updated_at'        => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Permohonan hak akses telah diajukan ulang ke OPD pemilik API.',
                'data'    => $existing,
            ]);
        }

        // Buat permohonan akses baru
        $apiKey = 'gkp_' . strtolower($user->opd->code ?? 'opd') . '_' . Str::random(24);

        $accessRequest = AccessRequest::create([
            'endpoint_id'       => $endpoint->id,
            'requestor_opd_id'  => $user->opd_id,
            'requested_methods' => $validated['requested_methods'] ?? ['GET'],
            'status'            => 'pending',
            'api_key'           => $apiKey,
            'expires_at'        => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan hak akses API berhasil diajukan! Menunggu persetujuan dari OPD pemilik API.',
            'data'    => $accessRequest->load(['endpoint.opd', 'requestorOpd']),
        ], 201);
    }

    /**
     * Setujui Permohonan Hak Akses (Approve)
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();
        $accessRequest = AccessRequest::with(['endpoint', 'requestorOpd'])->findOrFail($id);

        // Cek wewenang: hanya admin atau owner OPD yang berhak menyetujui
        if ($user->role !== 'admin' && (int)$user->opd_id !== (int)$accessRequest->endpoint->opd_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menyetujui permohonan API milik OPD lain.',
            ], 403);
        }

        $accessRequest->update([
            'status'     => 'approved',
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Permohonan hak akses dari \"{$accessRequest->requestorOpd->name}\" berhasil DISETUJUI.",
            'data'    => $accessRequest,
        ]);
    }

    /**
     * Tolak Permohonan Hak Akses (Reject)
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();
        $accessRequest = AccessRequest::with(['endpoint', 'requestorOpd'])->findOrFail($id);

        if ($user->role !== 'admin' && (int)$user->opd_id !== (int)$accessRequest->endpoint->opd_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menolak permohonan API milik OPD lain.',
            ], 403);
        }

        $accessRequest->update([
            'status'     => 'rejected',
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Permohonan hak akses dari \"{$accessRequest->requestorOpd->name}\" telah DITOLAK.",
            'data'    => $accessRequest,
        ]);
    }
}

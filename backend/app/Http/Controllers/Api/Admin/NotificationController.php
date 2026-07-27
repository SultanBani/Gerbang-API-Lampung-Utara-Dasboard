<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Notifications\GatewayAlertNotification;

class NotificationController extends Controller
{
    /**
     * Get all unread notifications for the authenticated admin.
     */
    public function getUnread(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->unreadNotifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'desc' => $notification->data['message'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'icon' => $notification->data['icon'] ?? 'Bell',
                'color' => $notification->data['color'] ?? 'text-blue-500 bg-blue-500/10',
                'time' => $notification->created_at->diffForHumans(),
                'read_at' => $notification->read_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Trigger a test notification (For Testing Purposes)
     */
    public function triggerTestNotification(Request $request)
    {
        $user = $request->user();

        // Pilih tipe acak untuk testing
        $types = [
            ['title' => 'Peringatan Keamanan API Key', 'desc' => 'API Key SIMPEG BKD mendekati masa rotasi tahunan.', 'type' => 'warning', 'icon' => 'KeyRound', 'color' => 'text-amber-500 bg-amber-500/10'],
            ['title' => 'Deteksi High Request Traffic', 'desc' => 'SIAK Dukcapil mencatat 1.200 request/jam pada endpoint /penduduk.', 'type' => 'info', 'icon' => 'ShieldAlert', 'color' => 'text-blue-500 bg-blue-500/10'],
            ['title' => 'Upstream Server Offline', 'desc' => 'Server SIPKD BPKAD sempat mengalami kendala koneksi (Status 502).', 'type' => 'error', 'icon' => 'ServerOff', 'color' => 'text-red-500 bg-red-500/10'],
        ];
        
        $random = $types[array_rand($types)];

        $user->notify(new GatewayAlertNotification(
            $random['title'],
            $random['desc'],
            $random['type'],
            $random['icon'],
            $random['color']
        ));

        return response()->json([
            'success' => true,
            'message' => 'Test notification triggered successfully!'
        ]);
    }
}

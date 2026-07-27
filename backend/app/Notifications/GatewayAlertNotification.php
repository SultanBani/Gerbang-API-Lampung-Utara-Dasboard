<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class GatewayAlertNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $title;
    public $message;
    public $type;
    public $icon;
    public $color;

    public function __construct($title, $message, $type = 'info', $icon = 'Bell', $color = 'text-blue-500 bg-blue-500/10')
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->icon = $icon;
        $this->color = $color;
    }

    public function via($notifiable)
    {
        // Menyimpan ke database dan mengirimkan secara real-time via WebSocket
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'icon' => $this->icon,
            'color' => $this->color,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

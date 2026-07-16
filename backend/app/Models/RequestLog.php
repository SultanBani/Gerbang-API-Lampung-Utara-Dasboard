<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestLog extends Model
{
    protected $fillable = [
        'api_key_id',
        'application_id',
        'endpoint_id',
        'method',
        'url',
        'status_code',
        'response_time_ms',
        'ip_address',
        'request_payload',
        'response_payload',
    ];

    protected $casts = [
        'status_code' => 'integer',
        'response_time_ms' => 'integer',
    ];

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class);
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function endpoint()
    {
        return $this->belongsTo(Endpoint::class);
    }
}

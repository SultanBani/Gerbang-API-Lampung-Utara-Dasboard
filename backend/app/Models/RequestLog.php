<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestLog extends Model
{
    protected $fillable = [
        'access_request_id',
        'endpoint_id',
        'opd_id',
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

    /**
     * AccessRequest yang terkait dengan log ini.
     */
    public function accessRequest(): BelongsTo
    {
        return $this->belongsTo(AccessRequest::class);
    }

    /**
     * Endpoint yang diakses.
     */
    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(Endpoint::class);
    }

    /**
     * OPD yang melakukan request.
     */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }
}

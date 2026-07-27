<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessRequest extends Model
{
    protected $fillable = [
        'endpoint_id',
        'requestor_opd_id',
        'requested_methods',
        'status',
        'api_key',
        'expires_at',
    ];

    protected $casts = [
        'requested_methods' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Endpoint yang diminta aksesnya.
     */
    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(Endpoint::class);
    }

    /**
     * OPD yang mengajukan permintaan akses.
     */
    public function requestorOpd(): BelongsTo
    {
        return $this->belongsTo(Opd::class, 'requestor_opd_id');
    }

    /**
     * Cek apakah akses sudah disetujui.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Cek apakah API key sudah kadaluarsa.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}

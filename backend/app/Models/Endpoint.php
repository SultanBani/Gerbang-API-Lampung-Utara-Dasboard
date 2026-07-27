<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Endpoint extends Model
{
    protected $fillable = [
        'opd_id',
        'title',
        'slug',
        'target_url',
        'method_permissions',
        'is_active',
    ];

    protected $casts = [
        'method_permissions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * OPD yang memiliki/menyediakan endpoint ini.
     */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    /**
     * Semua permintaan akses yang ditujukan ke endpoint ini.
     */
    public function accessRequests(): HasMany
    {
        return $this->hasMany(AccessRequest::class);
    }
}

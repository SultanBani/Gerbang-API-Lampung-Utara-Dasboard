<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Opd extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    /**
     * Users yang tergabung dalam OPD ini.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Endpoint API yang dimiliki/disediakan oleh OPD ini.
     */
    public function endpoints(): HasMany
    {
        return $this->hasMany(Endpoint::class);
    }

    /**
     * Permintaan akses yang diajukan oleh OPD ini ke endpoint milik OPD lain.
     */
    public function accessRequests(): HasMany
    {
        return $this->hasMany(AccessRequest::class, 'requestor_opd_id');
    }
}

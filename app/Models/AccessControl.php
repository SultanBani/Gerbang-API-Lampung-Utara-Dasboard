<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessControl extends Model
{
    protected $fillable = [
        'application_id',
        'endpoint_id',
        'is_allowed',
    ];

    protected $casts = [
        'is_allowed' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function endpoint()
    {
        return $this->belongsTo(Endpoint::class);
    }
}

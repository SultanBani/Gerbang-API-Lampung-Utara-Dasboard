<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Endpoint extends Model
{
    protected $fillable = [
        'method',
        'url',
        'description',
        'tag',
        'is_auth_required',
        'rate_limit',
    ];

    protected $casts = [
        'is_auth_required' => 'boolean',
        'rate_limit' => 'integer',
    ];

    public function accessControls()
    {
        return $this->hasMany(AccessControl::class);
    }

    public function applications()
    {
        return $this->belongsToMany(Application::class, 'access_controls')
                    ->withPivot('is_allowed')
                    ->withTimestamps();
    }

    public function requestLogs()
    {
        return $this->hasMany(RequestLog::class);
    }
}

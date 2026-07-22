<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'name',
        'opd',
        'pic_name',
        'pic_phone',
        'description',
        'status',
    ];

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

    public function accessControls()
    {
        return $this->hasMany(AccessControl::class);
    }

    public function endpoints()
    {
        return $this->belongsToMany(Endpoint::class, 'access_controls')
                    ->withPivot('is_allowed')
                    ->withTimestamps();
    }

    public function requestLogs()
    {
        return $this->hasMany(RequestLog::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}

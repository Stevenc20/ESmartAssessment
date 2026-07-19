<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';
    protected $fillable = [
        'key',
        'value',
        'type',
        'label',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    public static function getValue(string $key, $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function isFeatureEnabled(string $feature, bool $default = true): bool
    {
        $value = static::where('key', $feature)->value('value');
        if ($value === null) {
            return $default;
        }
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}

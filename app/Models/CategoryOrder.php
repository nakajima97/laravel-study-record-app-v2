<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryOrder extends Model
{
    protected $fillable = [
        'user_id',
        'category_order'
    ];

    protected $casts = [
        'category_order' => 'array'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

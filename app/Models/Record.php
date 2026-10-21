<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    /** @use HasFactory<\Database\Factories\RecordFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'minute',
        'note'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Category, $this>
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

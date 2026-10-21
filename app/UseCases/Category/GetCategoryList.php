<?php

namespace App\UseCases\Category;

use App\Models\Category;
use App\Models\CategoryOrder;

class GetCategoryList
{
    /**
     * @param int|string|null $user_id
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category>
     */
    public function __invoke($user_id)
    {
        $category_order = CategoryOrder::where('user_id', $user_id)->first();
        $query = Category::where('user_id', $user_id)->where('is_archive', false);
        if (!is_null($category_order) && count($category_order->category_order) > 0) {
            // 並び順に含まれないカテゴリー（FIELD() が 0）が先頭、その後に並び順どおりに並ぶ
            $order = array_map('intval', $category_order->category_order);
            $placeholders = implode(',', array_fill(0, count($order), '?'));
            $query = $query->orderByRaw("FIELD(id, {$placeholders})", $order);
        }
        return $query->get();
    }
}

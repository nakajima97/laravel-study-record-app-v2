<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCategoryOrderRequest;
use App\UseCases\CategoryOrder\UpdateCategoryOrder;
use Illuminate\Support\Facades\Auth;

class CategoryOrderController extends Controller
{
    /**
     * ログインユーザーのカテゴリーの並び順を更新する
     *
     * @param \App\Http\Requests\UpdateCategoryOrderRequest $request
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCategoryOrderRequest $request)
    {
        $user_id = (int) Auth::id();

        $update_category_order = new UpdateCategoryOrder();
        $update_category_order($user_id, $request->categoryOrder());

        return response()->noContent();
    }
}

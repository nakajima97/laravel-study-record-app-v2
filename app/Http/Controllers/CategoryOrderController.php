<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCategoryOrderRequest;
use App\UseCases\CategoryOrder\UpdateCategoryOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CategoryOrderController extends Controller
{
    /**
     * ログインユーザーのカテゴリーの並び順を更新する
     *
     * 画面（Inertia）からのリクエストは元の画面に戻し、JSON のリクエストには 204 を返す
     */
    public function update(UpdateCategoryOrderRequest $request): Response|RedirectResponse
    {
        $user_id = (int) Auth::id();

        $update_category_order = new UpdateCategoryOrder();
        $update_category_order($user_id, $request->categoryOrder());

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return back();
    }
}

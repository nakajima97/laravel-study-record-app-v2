<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * カテゴリーの並び替え（/category-order）
 *
 * 旧 /api/category-order は認証なしで body の user_id を信用していたが、
 * ログインユーザーの並び順だけを更新する仕様に変更した（承認済み）
 */
class CategoryOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_ログインしていないときは並び順を更新できずログイン画面へリダイレクトする(): void
    {
        $user = User::factory()->create();
        CategoryOrder::create(['user_id' => $user->id, 'category_order' => [1, 2]]);

        $response = $this->patch('/category-order', ['user_id' => $user->id, 'category_order' => [2, 1]]);

        $response->assertRedirect('/');
        $this->assertSame([1, 2], CategoryOrder::where('user_id', $user->id)->first()->category_order);
    }

    public function test_ログインしていないときの_JSON_リクエストは401になる(): void
    {
        $this->patchJson('/category-order', ['category_order' => [2, 1]])->assertStatus(401);
    }

    public function test_ログインユーザーの並び順を更新できる(): void
    {
        $user = User::factory()->create();
        $categories = Category::factory()->count(3)->create(['user_id' => $user->id]);
        $ids = $categories->pluck('id')->all();
        CategoryOrder::create(['user_id' => $user->id, 'category_order' => $ids]);

        $reordered = [$ids[2], $ids[0], $ids[1]];
        $response = $this->actingAs($user)->patchJson('/category-order', ['category_order' => $reordered]);

        $response->assertNoContent();
        $this->assertSame($reordered, CategoryOrder::where('user_id', $user->id)->first()->category_order);
        $this->assertDatabaseCount('category_orders', 1);

        // 一覧は新しい並び順で表示される
        $this->actingAs($user)->get('/categories')
            ->assertInertia(fn (Assert $page) => $page
                ->where('categories', fn (Collection $list) => $list->pluck('id')->all() === $reordered));
    }

    public function test_画面からの並び替えは保存してカテゴリー一覧に戻る(): void
    {
        $user = User::factory()->create();
        $categories = Category::factory()->count(2)->create(['user_id' => $user->id]);
        $ids = $categories->pluck('id')->all();
        CategoryOrder::create(['user_id' => $user->id, 'category_order' => $ids]);

        $reordered = [$ids[1], $ids[0]];
        $response = $this->actingAs($user)
            ->from('/categories')
            ->withHeaders(['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'])
            ->patch('/category-order', ['category_order' => $reordered]);

        $response->assertRedirect('/categories');
        $this->assertSame($reordered, CategoryOrder::where('user_id', $user->id)->first()->category_order);
    }

    public function test_並び順がないユーザーは新しく作成される(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patchJson('/category-order', ['category_order' => [3, 1, 2]])->assertNoContent();

        $this->assertDatabaseCount('category_orders', 1);
        $this->assertSame([3, 1, 2], CategoryOrder::where('user_id', $user->id)->first()->category_order);
    }

    public function test_リクエストの_user_id_は無視され_他人の並び順は書き換えられない(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();
        CategoryOrder::create(['user_id' => $other_user->id, 'category_order' => [1, 2]]);

        $response = $this->actingAs($user)->patchJson('/category-order', [
            'user_id' => $other_user->id,
            'category_order' => [2, 1],
        ]);

        $response->assertNoContent();
        $this->assertSame([1, 2], CategoryOrder::where('user_id', $other_user->id)->first()->category_order);
        $this->assertSame([2, 1], CategoryOrder::where('user_id', $user->id)->first()->category_order);
    }

    public function test_並び順が配列でないときは更新できない(): void
    {
        $user = User::factory()->create();
        CategoryOrder::create(['user_id' => $user->id, 'category_order' => [1, 2]]);

        $this->actingAs($user)->patchJson('/category-order', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('category_order');
        $this->actingAs($user)->patchJson('/category-order', ['category_order' => 'abc'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('category_order');
        $this->actingAs($user)->patchJson('/category-order', ['category_order' => ['x']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('category_order.0');

        $this->assertSame([1, 2], CategoryOrder::where('user_id', $user->id)->first()->category_order);
    }
}

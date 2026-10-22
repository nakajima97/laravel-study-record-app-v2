<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\CategoryOrder;

use function PHPUnit\Framework\assertEquals;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_ログインしていないときはカテゴリー一覧にアクセスできない(): void
    {
        $response = $this->get('/categories');

        $response->assertStatus(302);
        $response->assertRedirect('/');
    }

    public function test_カテゴリー一覧に自分が登録したカテゴリーだけが表示される(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();

        $categories = Category::factory()->count(3)->create([
            'user_id' => $user->id
        ]);

        $other_users_category = Category::factory()->create([
            'user_id' => $other_user->id
        ]);

        $response = $this->actingAs($user)
            ->get('/categories');

        $response->assertStatus(200);
        // 他人のカテゴリーは含まれない
        $response->assertInertia(fn (Assert $page) => $page
            ->component('category-list')
            ->where('categories', $categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])->all()));
    }

    public function test_カテゴリーの登録が可能(): void
    {
        $user = User::factory()->create();

        $input = [
            'name' => 'テストカテゴリー',
            'user_id' => $user->id
        ];

        $response = $this->actingAs($user)
            ->post('/categories', $input);

        $response->assertStatus(302);
        $this->assertDatabaseHas('categories', $input);
    }

    public function test_カテゴリーを追加した際に末尾に追加される(): void
    {
        $user = User::factory()->create();

        $input1 = [
            'name' => 'テストカテゴリー1',
            'user_id' => $user->id
        ];

        $response1 = $this->actingAs($user)
            ->post('/categories', $input1);

        $response1->assertStatus(302);

        $input2 = [
            'name' => 'テストカテゴリー2',
            'user_id' => $user->id
        ];

        $response2 = $this->actingAs($user)
            ->post('/categories', $input2);

        $response2->assertStatus(302);

        $test_category_1 = Category::where('name', 'テストカテゴリー1')->first();
        $test_category_2 = Category::where('name', 'テストカテゴリー2')->first();
        $category_order = CategoryOrder::where('user_id', $user->id)->first();

        assertEquals([$test_category_1->id, $test_category_2->id], $category_order->category_order);
    }

    public function test_カテゴリーのアーカイブが可能(): void
    {
        $user = User::factory()->create();

        // アーカイブするためのカテゴリーを作成
        $category = Category::factory()->create();
        // 追加したときはアーカイブされていないことを検証
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'is_archive' => false]);

        $response = $this->actingAs($user)
            ->post('/categories/archive/' . $category->id);

        $response->assertStatus(302);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'is_archive' => true]);
    }

    public function test_カテゴリー名の変更が可能(): void
    {
        $user = User::factory()->create();

        $category = Category::factory()->create([
            'user_id' => $user->id
        ]);

        $input = [
            'name' => '変更後のカテゴリー名'
        ];

        $response = $this->actingAs($user)
            ->put('/categories/' . $category->id, $input);

        $response->assertStatus(302);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => '変更後のカテゴリー名']);
    }

    public function test_ログインしていないときはカテゴリーの各画面と操作にアクセスできない(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $this->get('/categories/create')->assertRedirect('/');
        $this->get('/categories/' . $category->id)->assertRedirect('/');
        $this->get('/categories/' . $category->id . '/edit')->assertRedirect('/');
        $this->post('/categories', ['name' => '未ログイン'])->assertRedirect('/');
        $this->put('/categories/' . $category->id, ['name' => '未ログイン'])->assertRedirect('/');
        $this->post('/categories/archive/' . $category->id)->assertRedirect('/');
        $this->delete('/categories/archive/' . $category->id)->assertRedirect('/');

        $this->assertDatabaseMissing('categories', ['name' => '未ログイン']);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => $category->name, 'is_archive' => false]);
    }

    public function test_カテゴリー一覧は並び順どおりに表示され_アーカイブ済みは別に渡される(): void
    {
        $user = User::factory()->create();

        $first = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリーA']);
        $second = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリーB']);
        $third = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリーC']);
        $archived = Category::factory()->create(['user_id' => $user->id, 'name' => 'アーカイブ済みカテゴリー']);
        $archived->archive();

        CategoryOrder::create([
            'user_id' => $user->id,
            'category_order' => [$third->id, $first->id, $second->id],
        ]);

        $response = $this->actingAs($user)->get('/categories');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('category-list')
            ->where('categories', [
                ['id' => $third->id, 'name' => 'カテゴリーC'],
                ['id' => $first->id, 'name' => 'カテゴリーA'],
                ['id' => $second->id, 'name' => 'カテゴリーB'],
            ])
            ->where('archive_categories', [
                ['id' => $archived->id, 'name' => 'アーカイブ済みカテゴリー'],
            ]));
    }

    public function test_カテゴリー追加画面を表示できる(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/categories/create');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('category-create'));
    }

    public function test_カテゴリーを登録するとログインユーザーのカテゴリーになり一覧へリダイレクトする(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/categories', ['name' => '新しいカテゴリー']);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', [
            'name' => '新しいカテゴリー',
            'user_id' => $user->id,
            'is_archive' => false,
        ]);
    }

    public function test_カテゴリー名が空のときは登録できない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from('/categories/create')
            ->post('/categories', ['name' => '']);

        $response->assertRedirect('/categories/create');
        $response->assertSessionHasErrors('name');
        $this->assertDatabaseCount('categories', 0);
        $this->assertDatabaseCount('category_orders', 0);
    }

    public function test_カテゴリー詳細画面を表示できる(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => '詳細カテゴリー']);

        $response = $this->actingAs($user)->get('/categories/' . $category->id);

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('category-detail')
            ->where('category', ['id' => $category->id, 'name' => '詳細カテゴリー']));
    }

    public function test_存在しないカテゴリーの詳細_編集_更新は404になる(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/categories/999999')->assertStatus(404);
        $this->actingAs($user)->get('/categories/999999/edit')->assertStatus(404);
        $this->actingAs($user)->put('/categories/999999', ['name' => '変更'])->assertStatus(404);
    }

    public function test_カテゴリー編集画面には現在の名前とアーカイブボタンが表示される(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => '編集カテゴリー']);

        $response = $this->actingAs($user)->get('/categories/' . $category->id . '/edit');

        $response->assertStatus(200);
        // アーカイブされていないので「アーカイブする」ボタンを出す
        $response->assertInertia(fn (Assert $page) => $page
            ->component('category-edit')
            ->where('category', ['id' => $category->id, 'name' => '編集カテゴリー', 'is_archive' => false]));
    }

    public function test_アーカイブ済みカテゴリーの編集画面にはアーカイブ解除ボタンが表示される(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);
        $category->archive();

        $response = $this->actingAs($user)->get('/categories/' . $category->id . '/edit');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('category-edit')
            ->where('category.is_archive', true));
    }

    public function test_カテゴリー名を変更すると一覧へリダイレクトする(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => '変更前']);

        $response = $this->actingAs($user)->put('/categories/' . $category->id, ['name' => '変更後']);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => '変更後', 'user_id' => $user->id]);
    }

    public function test_カテゴリーをアーカイブすると一覧へリダイレクトし_通常の一覧から外れる(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post('/categories/archive/' . $category->id);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'is_archive' => true]);

        $this->actingAs($user)->get('/categories')
            ->assertInertia(fn (Assert $page) => $page
                ->has('categories', 0)
                ->where('archive_categories.0.id', $category->id)
                ->has('archive_categories', 1));
    }

    public function test_カテゴリーのアーカイブを解除すると一覧へリダイレクトし_通常の一覧に戻る(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);
        $category->archive();

        $response = $this->actingAs($user)->delete('/categories/archive/' . $category->id);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'is_archive' => false]);

        $this->actingAs($user)->get('/categories')
            ->assertInertia(fn (Assert $page) => $page
                ->where('categories.0.id', $category->id)
                ->has('categories', 1)
                ->has('archive_categories', 0));
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class RecordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_ログインしていないときはレコード作成画面にアクセスできない(): void
    {
        $response = $this->get('/records/create');

        $response->assertStatus(302);
        $response->assertRedirect('/');
    }

    public function test_ログインしているときはレコード作成画面にログインできる(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/records/create');

        $response->assertStatus(200);
    }

    public function test_レコード作成が可能(): void
    {
        $user = User::factory()->create();

        $category = Category::factory()->create([
            'user_id' => $user->id
        ]);

        $input = [
            'category_id' => $category->id,
            'minute' => 30,
            'note' => 'test'
        ];

        $response = $this->actingAs($user)
            ->post('records', $input);

        $this->assertDatabaseHas('records', $input);
    }

    public function test_ログインしていないときはレコードを登録できない(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->post('/records', [
            'category_id' => $category->id,
            'minute' => 30,
            'note' => 'test',
        ]);

        $response->assertRedirect('/');
        $this->assertDatabaseCount('records', 0);
    }

    public function test_レコード作成画面には自分のアーカイブされていないカテゴリーが並び順どおりに表示される(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();

        $first = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリーA']);
        $second = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリーB']);
        $archived = Category::factory()->create(['user_id' => $user->id, 'name' => 'アーカイブ済みカテゴリー']);
        $archived->archive();
        $others = Category::factory()->create(['user_id' => $other_user->id, 'name' => '他人のカテゴリー']);

        CategoryOrder::create([
            'user_id' => $user->id,
            'category_order' => [$second->id, $first->id],
        ]);

        $response = $this->actingAs($user)->get('/records/create');

        $response->assertStatus(200);
        $response->assertSeeText('学習記録追加');
        $response->assertSeeText('ストップウォッチを表示する');
        $response->assertSeeText('記録追加');
        $response->assertSeeTextInOrder(['カテゴリーB', 'カテゴリーA']);
        $response->assertDontSeeText('アーカイブ済みカテゴリー');
        $response->assertDontSeeText('他人のカテゴリー');
        $response->assertViewHas('records', function ($records) use ($first, $second) {
            return $records->pluck('id')->all() === [$second->id, $first->id];
        });
    }

    public function test_レコードを登録するとログインユーザーの記録になりダッシュボードへリダイレクトする(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post('/records', [
            'category_id' => $category->id,
            'minute' => 45,
            'note' => null,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('records', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 45,
            'note' => null,
        ]);
    }

    public function test_カテゴリーと時間が不正なときはレコードを登録できない(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from('/records/create')
            ->post('/records', [
                'category_id' => '',
                'minute' => 'abc',
                'note' => 'test',
            ]);

        $response->assertRedirect('/records/create');
        $response->assertSessionHasErrors(['category_id', 'minute']);
        $response->assertSessionDoesntHaveErrors('note');
        $this->assertDatabaseCount('records', 0);
    }
}

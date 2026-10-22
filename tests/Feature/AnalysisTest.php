<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalysisTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2024-05-15 12:00:00'));
    }

    public function test_ログインしていないときは分析画面にアクセスできない(): void
    {
        $response = $this->get('/records/analysis');

        $response->assertStatus(302);
        $response->assertRedirect('/');
    }

    public function test_記録がないときも分析画面を表示できる(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/records/analysis');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('analysis')
            ->where('total_learning_time', 0)
            ->has('monthly_records.data', 0)
            ->has('total_learning_time_by_category', 0));
    }

    public function test_直近7日間の日ごとの学習時間が古い順に渡され_記録のない日は0になる(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $this->createRecord($user, $category, 30, '2024-05-15 09:00:00');
        $this->createRecord($user, $category, 15, '2024-05-15 20:00:00');
        $this->createRecord($user, $category, 40, '2024-05-12 10:00:00');
        $this->createRecord($user, $category, 25, '2024-05-09 00:00:00');
        // 8 日前と他人の記録は含まれない
        $this->createRecord($user, $category, 100, '2024-05-08 23:59:59');
        $this->createRecord($other_user, $category, 100, '2024-05-15 10:00:00');

        $response = $this->actingAs($user)->get('/records/analysis');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('analysis')
            ->where('daily_records', [
                ['year' => 2024, 'month' => 5, 'day' => 9, 'total_time' => 25],
                ['year' => 2024, 'month' => 5, 'day' => 10, 'total_time' => 0],
                ['year' => 2024, 'month' => 5, 'day' => 11, 'total_time' => 0],
                ['year' => 2024, 'month' => 5, 'day' => 12, 'total_time' => 40],
                ['year' => 2024, 'month' => 5, 'day' => 13, 'total_time' => 0],
                ['year' => 2024, 'month' => 5, 'day' => 14, 'total_time' => 0],
                ['year' => 2024, 'month' => 5, 'day' => 15, 'total_time' => 45],
            ]));
    }

    public function test_月ごとの総学習時間が新しい順に10件ずつ表示される(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        // 2023 年 4 月〜2024 年 5 月の 14 か月分
        $month = Carbon::parse('2023-04-10 10:00:00');
        while ($month->lte(Carbon::parse('2024-05-31'))) {
            $this->createRecord($user, $category, 60, $month->toDateTimeString());
            $month->addMonth();
        }
        $this->createRecord($user, $category, 65, '2024-05-01 10:00:00');
        $this->createRecord($other_user, $category, 999, '2024-05-02 10:00:00');

        $response = $this->actingAs($user)->get('/records/analysis');

        $response->assertStatus(200);
        // 2024 年 5 月〜2023 年 8 月の 10 件（他人の記録は含まれない）
        $response->assertInertia(fn (Assert $page) => $page
            ->component('analysis')
            ->where('monthly_records.total', 14)
            ->where('monthly_records.per_page', 10)
            ->has('monthly_records.data', 10)
            ->where('monthly_records.data.0', ['year' => 2024, 'month' => 5, 'total_time' => 125])
            ->where('monthly_records.data.1', ['year' => 2024, 'month' => 4, 'total_time' => 60])
            ->where('monthly_records.data.9', ['year' => 2023, 'month' => 8, 'total_time' => 60]));

        $page2 = $this->actingAs($user)->get('/records/analysis?page=2');

        $page2->assertStatus(200);
        $page2->assertInertia(fn (Assert $page) => $page
            ->where('monthly_records.data', [
                ['year' => 2023, 'month' => 7, 'total_time' => 60],
                ['year' => 2023, 'month' => 6, 'total_time' => 60],
                ['year' => 2023, 'month' => 5, 'total_time' => 60],
                ['year' => 2023, 'month' => 4, 'total_time' => 60],
            ]));
    }

    public function test_総学習時間が自分の記録の合計で表示される(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $this->createRecord($user, $category, 100, '2024-05-15 10:00:00');
        $this->createRecord($user, $category, 35, '2023-01-01 10:00:00');
        $this->createRecord($other_user, $category, 999, '2024-05-15 10:00:00');

        $response = $this->actingAs($user)->get('/records/analysis');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->where('total_learning_time', 135));
    }

    public function test_カテゴリーごとの学習時間が多い順に上位10件だけ渡される(): void
    {
        $user = User::factory()->create();
        $other_user = User::factory()->create();

        // カテゴリー 1〜11 に 10, 20, ..., 110 分ずつ記録する
        $categories = collect(range(1, 11))->map(function ($i) use ($user) {
            $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'カテゴリー' . $i]);
            $this->createRecord($user, $category, $i * 10, '2024-05-15 10:00:00');

            return $category;
        });
        // 同じカテゴリーの記録は合算される
        $this->createRecord($user, $categories[0], 200, '2024-01-01 10:00:00');
        // 他人の記録は含まれない
        $this->createRecord($other_user, $categories[1], 1000, '2024-05-15 10:00:00');

        $response = $this->actingAs($user)->get('/records/analysis');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('total_learning_time_by_category', [
                ['name' => 'カテゴリー1', 'total_learning_time' => 210],
                ['name' => 'カテゴリー11', 'total_learning_time' => 110],
                ['name' => 'カテゴリー10', 'total_learning_time' => 100],
                ['name' => 'カテゴリー9', 'total_learning_time' => 90],
                ['name' => 'カテゴリー8', 'total_learning_time' => 80],
                ['name' => 'カテゴリー7', 'total_learning_time' => 70],
                ['name' => 'カテゴリー6', 'total_learning_time' => 60],
                ['name' => 'カテゴリー5', 'total_learning_time' => 50],
                ['name' => 'カテゴリー4', 'total_learning_time' => 40],
                ['name' => 'カテゴリー3', 'total_learning_time' => 30],
            ]));
    }

    private function createRecord(User $user, Category $category, int $minute, string $created_at): Record
    {
        return Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => $minute,
            'created_at' => $created_at,
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        $response->assertSeeTextInOrder([
            '分析',
            '直近7日間の学習時間',
            '月ごとの総学習時間',
            '年月',
            '学習時間',
            '総学習時間',
            '0時間0分',
            'カテゴリーごとの学習時間（Top10のみ表示）',
        ]);
        $response->assertViewHas('total_learning_time', 0);
        $response->assertViewHas('monthly_records', fn ($records) => $records->isEmpty());
        $response->assertViewHas('total_learning_time_by_category', fn ($records) => $records->isEmpty());
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
        $response->assertViewHas('daily_records', function ($daily_records) {
            $actual = $daily_records->map(fn ($record) => [
                (int) $record['year'],
                (int) $record['month'],
                (int) $record['day'],
                (int) $record['total_time'],
            ])->all();

            return $actual === [
                [2024, 5, 9, 25],
                [2024, 5, 10, 0],
                [2024, 5, 11, 0],
                [2024, 5, 12, 40],
                [2024, 5, 13, 0],
                [2024, 5, 14, 0],
                [2024, 5, 15, 45],
            ];
        });
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
        $response->assertSeeTextInOrder([
            '2024年5月', '2時間5分',
            '2024年4月', '1時間0分',
            '2023年8月', '1時間0分',
        ]);
        $response->assertDontSeeText('2023年7月');
        $response->assertViewHas('monthly_records', function ($records) {
            return $records->total() === 14
                && $records->perPage() === 10
                && $records->count() === 10
                && (int) $records->first()->total_time === 125;
        });

        $page2 = $this->actingAs($user)->get('/records/analysis?page=2');

        $page2->assertStatus(200);
        $page2->assertSeeTextInOrder(['2023年7月', '2023年6月', '2023年5月', '2023年4月']);
        $page2->assertDontSeeText('2023年8月');
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
        $response->assertSeeTextInOrder(['総学習時間', '2時間15分']);
        $response->assertViewHas('total_learning_time', 135);
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
        $response->assertViewHas('total_learning_time_by_category', function ($records) {
            $actual = $records->map(fn ($record) => [$record->name, (int) $record->total_learning_time])->all();

            return $actual === [
                ['カテゴリー1', 210],
                ['カテゴリー11', 110],
                ['カテゴリー10', 100],
                ['カテゴリー9', 90],
                ['カテゴリー8', 80],
                ['カテゴリー7', 70],
                ['カテゴリー6', 60],
                ['カテゴリー5', 50],
                ['カテゴリー4', 40],
                ['カテゴリー3', 30],
            ];
        });
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

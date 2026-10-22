<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_非ログイン状態ではダッシュボードを開けない(): void
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(302);
    }

    public function test_ログイン状態ではダッシュボードを開くことができる(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('dashboard'));
    }

    public function test_今日の学習記録一覧が表示されている(): void
    {
        $user = User::factory()->create();

        [$categories, $records] = $this->createCategoryAndRecord($user->id);

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);

        $expected = $records->map(fn ($record) => [
            'id' => $record->id,
            'category_name' => $record->category->name,
            'minute' => $record->minute,
            'note' => $record->note,
        ])->sortBy('id')->values()->all();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('today_records', fn (Collection $today_records) => $today_records
                ->map(fn ($record) => [
                    'id' => $record['id'],
                    'category_name' => $record['category_name'],
                    'minute' => $record['minute'],
                    'note' => $record['note'],
                ])->sortBy('id')->values()->all() === $expected));
    }

    public function test_今日の総学習時間が表示されている(): void
    {
        $user = User::factory()->create();

        [$categories, $records] = $this->createCategoryAndRecord($user->id);
        $day = Carbon::now()->day() === 1 ? Carbon::tomorrow() : Carbon::yesterday();
        $yesterday_record = Record::factory()->create([
            'user_id' => $user->id,
            'created_at' => $day
        ]);

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);

        $total_minute = $records->sum('minute');

        $response->assertInertia(fn (Assert $page) => $page->where('total_study_time_today', $total_minute));
    }

    public function test_今月の総学習時間が表示されている(): void
    {
        $user = User::factory()->create();

        [$categories, $records] = $this->createCategoryAndRecord($user->id);
        $day = Carbon::now()->day() === 1 ? Carbon::tomorrow() : Carbon::yesterday();
        $yesterday_record = Record::factory()->create([
            'user_id' => $user->id,
            'created_at' => $day
        ]);

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);

        $total_minute = $records->sum('minute') + $yesterday_record->minute;

        $response->assertInertia(fn (Assert $page) => $page->where('total_study_time_this_month', $total_minute));
    }

    public function test_ダッシュボードには自分の今日の記録が新しい順に表示される(): void
    {
        $this->travelTo(Carbon::parse('2024-05-15 12:00:00'));

        $user = User::factory()->create();
        $other_user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => '英語']);

        $older = Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 20,
            'note' => '朝の学習',
            'created_at' => '2024-05-15 08:00:00',
        ]);
        $newer = Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 50,
            'note' => '昼の学習',
            'created_at' => '2024-05-15 11:00:00',
        ]);
        Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 10,
            'note' => '昨日の学習',
            'created_at' => '2024-05-14 23:00:00',
        ]);
        Record::factory()->create([
            'user_id' => $other_user->id,
            'category_id' => $category->id,
            'minute' => 99,
            'note' => '他人の学習',
            'created_at' => '2024-05-15 09:00:00',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        // 昨日の記録と他人の記録は含まれない
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('today_records', [
                [
                    'id' => $newer->id,
                    'category_name' => '英語',
                    'created_at' => '2024-05-15 11:00:00',
                    'minute' => 50,
                    'note' => '昼の学習',
                ],
                [
                    'id' => $older->id,
                    'category_name' => '英語',
                    'created_at' => '2024-05-15 08:00:00',
                    'minute' => 20,
                    'note' => '朝の学習',
                ],
            ]));
    }

    public function test_ダッシュボードの総学習時間は60分以上のときだけ時間を表示する(): void
    {
        $this->travelTo(Carbon::parse('2024-05-15 12:00:00'));

        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);

        // 今日: 45 分、今月: 45 + 80 = 125 分
        Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 45,
            'created_at' => '2024-05-15 10:00:00',
        ]);
        Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 80,
            'created_at' => '2024-05-01 10:00:00',
        ]);
        // 先月の記録は今月に含まれない
        Record::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'minute' => 300,
            'created_at' => '2024-04-30 23:00:00',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('total_study_time_this_month', 125)
            ->where('total_study_time_today', 45));
    }

    public function test_記録がないときの総学習時間は0分と表示される(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('total_study_time_this_month', 0)
            ->where('total_study_time_today', 0)
            ->has('today_records', 0));
    }

    /**
     * categoriesとrecordsにデータを追加する
     * @param int|string|null $user_id
     */
    private function createCategoryAndRecord($user_id)
    {
        $categories = Category::factory()->count(3)->create();
        $records = Record::factory()->count(5)->create([
            'user_id' => $user_id,
            'created_at' => now()
        ]);

        return [$categories, $records];
    }
}

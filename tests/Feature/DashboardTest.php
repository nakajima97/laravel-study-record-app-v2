<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
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
    }

    public function test_今日の学習記録一覧が表示されている(): void
    {
        $user = User::factory()->create();

        [$categories, $records] = $this->createCategoryAndRecord($user->id);

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertStatus(200);

        foreach ($records as $record) {
            $response->assertSeeText($record->category->name);
            $response->assertSeeText($record->minute);
            $response->assertSeeText($record->note);
        }
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

        $response->assertSeeText(floor($total_minute / 60) . '時間');
        $response->assertSeeText($total_minute % 60 . '分');
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

        $response->assertSeeText(floor($total_minute / 60) . '時間');
        $response->assertSeeText($total_minute % 60 . '分');
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
        $response->assertSeeText('学習記録を付ける');
        $response->assertSeeTextInOrder([
            '今日の学習記録',
            '英語', '2024-05-15 11:00:00', '時間：50分', '昼の学習',
            '英語', '2024-05-15 08:00:00', '時間：20分', '朝の学習',
        ]);
        $response->assertDontSeeText('昨日の学習');
        $response->assertDontSeeText('他人の学習');
        $response->assertViewHas('today_records', function ($records) use ($older, $newer) {
            return $records->pluck('id')->all() === [$newer->id, $older->id];
        });
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
        $response->assertSeeTextInOrder(['今月の総学習時間：', '2時間', '5分', '今日の総学習時間：', '45分', '今日の学習記録']);
        $response->assertDontSeeText('0時間');
        $response->assertViewHas('total_study_time_this_month', 125);
        $response->assertViewHas('total_study_time_today', 45);
    }

    public function test_記録がないときの総学習時間は0分と表示される(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertSeeTextInOrder(['今月の総学習時間：', '0分', '今日の総学習時間：', '0分']);
        $response->assertViewHas('total_study_time_this_month', 0);
        $response->assertViewHas('total_study_time_today', 0);
        $response->assertViewHas('today_records', fn ($records) => $records->isEmpty());
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

<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryOrder;
use App\Models\Record;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Playwright の E2E 用のデータ。テストどうしが干渉しないよう、テストごとにユーザーを分ける
 */
class E2eSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create(['name' => 'ログインユーザー', 'email' => 'login@example.com']);

        $record_user = User::factory()->create(['name' => '記録ユーザー', 'email' => 'record@example.com']);
        $this->createCategories($record_user, ['読書', 'プログラミング']);

        $category_user = User::factory()->create(['name' => 'カテゴリーユーザー', 'email' => 'category@example.com']);
        $this->createCategories($category_user, ['並び替え1', '並び替え2', '並び替え3']);

        $analysis_user = User::factory()->create(['name' => '分析ユーザー', 'email' => 'analysis@example.com']);
        [$english, $math] = $this->createCategories($analysis_user, ['英語', '数学']);
        foreach ([[$english, 60], [$math, 30]] as [$category, $minute]) {
            Record::factory()->create([
                'user_id' => $analysis_user->id,
                'category_id' => $category->id,
                'minute' => $minute,
                'created_at' => now(),
            ]);
        }
    }

    /**
     * @param string[] $names
     * @return Category[]
     */
    private function createCategories(User $user, array $names): array
    {
        $categories = array_map(
            fn (string $name) => Category::factory()->create(['user_id' => $user->id, 'name' => $name]),
            $names
        );

        CategoryOrder::create([
            'user_id' => $user->id,
            'category_order' => array_map(fn (Category $category) => $category->id, $categories),
        ]);

        return $categories;
    }
}

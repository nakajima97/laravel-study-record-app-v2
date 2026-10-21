import { expect, login, test } from './fixtures';

test('分析画面に月ごとの学習時間と総学習時間が表示される', async ({ page }) => {
    await login(page, 'analysis@example.com');

    await page.getByRole('link', { name: '分析' }).first().click();
    await expect(page).toHaveURL('/records/analysis');

    await expect(page.getByRole('heading', { name: '分析', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '直近7日間の学習時間' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '月ごとの総学習時間' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '総学習時間', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'カテゴリーごとの学習時間（Top10のみ表示）' })).toBeVisible();

    // シーダーで今日（アプリのタイムゾーン）に 60 分と 30 分を記録している
    const today = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric' })
            .formatToParts(new Date())
            .map((part) => [part.type, part.value]),
    );
    const row = page.getByRole('row', { name: `${today.year}年${today.month}月` });
    await expect(row.getByRole('cell').nth(1)).toHaveText('1時間30分');

    await expect(page.getByText('1時間30分', { exact: true })).toHaveCount(2);
});

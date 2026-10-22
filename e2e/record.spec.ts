import { expect, login, test } from './fixtures';

test.beforeEach(async ({ page }) => {
    await login(page, 'record@example.com');
});

test('学習時間を分で入力して記録を登録すると、ダッシュボードに表示される', async ({ page }) => {
    await page.getByRole('link', { name: '学習記録を付ける' }).first().click();
    await expect(page).toHaveURL('/records/create');
    await expect(page.getByRole('heading', { name: '学習記録追加' })).toBeVisible();

    await page.getByLabel('カテゴリー', { exact: true }).selectOption({ label: 'プログラミング' });
    await page.getByLabel('時間', { exact: true }).fill('75');
    await page.getByLabel('メモ').fill('E2E で登録した記録');
    await page.getByRole('button', { name: '記録追加' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('今日の総学習時間： 1時間 15分')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'プログラミング' })).toBeVisible();
    await expect(page.getByText('時間：75分')).toBeVisible();
    await expect(page.getByText('E2E で登録した記録')).toBeVisible();
});

test('ストップウォッチのモーダルを開閉できる', async ({ page }) => {
    await page.goto('/records/create');

    const heading = page.getByRole('heading', { name: 'ストップウォッチ', exact: true });
    await expect(heading).toBeHidden();

    await page.getByRole('button', { name: 'ストップウォッチを表示する' }).click();
    await expect(heading).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

    await page.getByRole('button', { name: 'Close modal' }).click();
    await expect(heading).toBeHidden();
});

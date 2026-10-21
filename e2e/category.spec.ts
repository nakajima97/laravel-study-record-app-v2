import type { Page } from '@playwright/test';
import { expect, login, test } from './fixtures';

test.beforeEach(async ({ page }) => {
    await login(page, 'category@example.com');
});

async function openEditPage(page: Page, name: string): Promise<void> {
    await page.getByRole('heading', { name, exact: true }).click();
    await expect(page.getByText(`カテゴリー名：${name}`)).toBeVisible();
    await page.getByRole('link', { name: '編集' }).click();
    await expect(page.getByRole('heading', { name: 'カテゴリー編集' })).toBeVisible();
}

test('カテゴリーを作成し、名前を変更できる', async ({ page }) => {
    await page.getByRole('link', { name: 'カテゴリー一覧' }).first().click();
    await expect(page).toHaveURL('/categories');

    await page.getByRole('link', { name: 'カテゴリー追加' }).click();
    await page.getByLabel('カテゴリー名').fill('新規カテゴリー');
    await page.getByRole('button', { name: '追加', exact: true }).click();

    await expect(page).toHaveURL('/categories');
    await expect(page.getByRole('heading', { name: '新規カテゴリー', exact: true })).toBeVisible();

    await openEditPage(page, '新規カテゴリー');
    await expect(page.getByLabel('カテゴリー名')).toHaveValue('新規カテゴリー');
    await page.getByLabel('カテゴリー名').fill('変更後カテゴリー');
    await page.getByRole('button', { name: '更新' }).click();

    await expect(page).toHaveURL('/categories');
    await expect(page.getByRole('heading', { name: '変更後カテゴリー', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '新規カテゴリー', exact: true })).toHaveCount(0);
});

test('カテゴリーをアーカイブし、解除できる', async ({ page }) => {
    await page.goto('/categories/create');
    await page.getByLabel('カテゴリー名').fill('アーカイブ対象');
    await page.getByRole('button', { name: '追加', exact: true }).click();
    await expect(page).toHaveURL('/categories');

    const target = page.getByRole('heading', { name: 'アーカイブ対象', exact: true });

    await openEditPage(page, 'アーカイブ対象');
    await page.getByRole('button', { name: 'アーカイブする' }).click();

    await expect(page).toHaveURL('/categories');
    await expect(target).toBeHidden();

    await page.getByRole('link', { name: 'アーカイブ済み' }).click();
    await expect(target).toBeVisible();

    await openEditPage(page, 'アーカイブ対象');
    await page.getByRole('button', { name: 'アーカイブ解除する' }).click();

    await expect(page).toHaveURL('/categories');
    await expect(target).toBeVisible();
    await page.getByRole('link', { name: 'アーカイブ済み' }).click();
    await expect(target).toBeHidden();
});

test('カテゴリーをドラッグで並び替えると、再読み込み後も順番が保たれる', async ({ page }) => {
    await page.goto('/categories');

    const names = ['並び替え1', '並び替え2', '並び替え3'];
    const headings = page.getByRole('heading', { level: 3 }).filter({ hasText: /^並び替え\d$/ });
    await expect(headings).toHaveText(names);

    // 「並び替え3」を先頭の「並び替え1」の上にドロップすると先頭に移る
    const saved = page.waitForResponse(
        (response) => response.url().endsWith('/api/category-order') && response.request().method() === 'PATCH',
    );
    await page
        .getByRole('heading', { name: '並び替え3', exact: true })
        .dragTo(page.getByRole('heading', { name: '並び替え1', exact: true }));
    expect((await saved).ok()).toBe(true);

    const reordered = ['並び替え3', '並び替え1', '並び替え2'];
    await expect(headings).toHaveText(reordered);

    await page.reload();
    await expect(headings).toHaveText(reordered);
});

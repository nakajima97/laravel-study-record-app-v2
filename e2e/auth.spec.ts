import { expect, login, test } from './fixtures';

test('ログインしてダッシュボードを開き、ログアウトできる', async ({ page }) => {
    await login(page, 'login@example.com');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('今月の総学習時間：')).toBeVisible();
    await expect(page.getByText('今日の総学習時間：')).toBeVisible();

    await page.getByRole('button', { name: 'ログインユーザー' }).click();
    await page.getByRole('link', { name: 'Log Out' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
});

test('パスワードが違うとログインできない', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill('login@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByLabel('Email')).toHaveValue('login@example.com');
});

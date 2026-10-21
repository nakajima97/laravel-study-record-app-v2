import { execSync } from 'node:child_process';
import { test as base, expect, type Page } from '@playwright/test';

// テストごとに DB を E2E 用のデータで作り直し、テスト間（リトライを含む）で状態が残らないようにする
export const test = base.extend<{ resetDatabase: void }>({
    resetDatabase: [
        async ({}, use) => {
            try {
                execSync('php artisan migrate:fresh --seed --seeder=E2eSeeder --env=e2e --force', { stdio: 'pipe' });
            } catch (error) {
                // 失敗の原因（Laravel 側のエラー）がレポートに残るように出力を付けて投げ直す
                const { stdout, stderr } = error as { stdout?: Buffer; stderr?: Buffer };
                throw new Error(`DB のリセットに失敗した\n${stdout ?? ''}${stderr ?? ''}`);
            }
            await use();
        },
        { auto: true },
    ],
});

export { expect };

export async function login(page: Page, email: string): Promise<void> {
    await page.goto('/');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL('/dashboard');
}

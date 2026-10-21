import { defineConfig, devices } from '@playwright/test';

const port = 8001;

export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.ts',
    // 1 つの DB をテストごとに作り直すので直列で実行する
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://127.0.0.1:${port}`,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        // --no-reload を付けないと、環境変数（CI の DB_HOST など）がサーバーに渡らない
        command: `php artisan serve --env=e2e --no-reload --host=127.0.0.1 --port=${port}`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: !process.env.CI,
    },
});

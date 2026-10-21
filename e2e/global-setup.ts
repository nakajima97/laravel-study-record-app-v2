import { execSync } from 'node:child_process';

export default function globalSetup(): void {
    // E2E 用の DB がなければ作成する（データはテストごとに fixtures.ts で作り直す）
    execSync('php artisan migrate --env=e2e --force', { stdio: 'inherit' });
}

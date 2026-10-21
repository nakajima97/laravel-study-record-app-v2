#!/usr/bin/env bash
set -euo pipefail

composer install
composer install --working-dir=tools/php-cs-fixer
npm ci
# ブラウザは node_modules 配下に入る（PLAYWRIGHT_BROWSERS_PATH=0）ため npm ci のたびに入れ直す
npx playwright install chromium
# アプリの表示と E2E テストのためにビルドしておく（PHPUnit には不要）
npm run build

# APP_KEY が未設定なら生成する
grep -q '^APP_KEY=base64:' .env || php artisan key:generate

php artisan migrate --force

# GH_TOKEN があれば git の認証に gh を使う
if [ -n "${GH_TOKEN:-}" ]; then
    gh auth setup-git
fi

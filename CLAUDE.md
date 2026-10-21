# 学習記録アプリ

学習時間をカテゴリーごとに記録・分析する Laravel アプリ。

## 環境

- 本番: PHP 8.3 / MySQL 5.7
- **main へのマージで本番に自動デプロイされる**（`.github/workflows/auto-daploy.yaml`）
- 開発: devcontainer（Sail の `laravel.test` コンテナ）内で作業する。DB は同じ compose の `mysql`（5.7）
- テストは MySQL の `testing` DB を使う（`.env.testing` と `phpunit.xml`）

## コマンド

コンテナ内で実行する（`sail` 経由は不要）。

```sh
php artisan test             # PHPUnit（事前に npm run build が必要）
./vendor/bin/phpstan analyse # Larastan
./tools/php-cs-fixer/vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --dry-run  # コードスタイル
npm run build                # フロントのビルド
npm run test:e2e             # Playwright E2E（事前に npm run build が必要。DB は testing_e2e をテストごとに作り直す）
```

コードスタイルは php-cs-fixer で管理している（Pint は使わない）。

## フロントエンド

- TypeScript、Inertia.js、React
- ディレクトリ構成は Feature-Sliced Design（FSD）。ルートは `resources/js/`
  - レイヤー: `app` / `pages` / `widgets` / `features` / `entities` / `shared`
  - 上位レイヤーからの import、同一レイヤーのスライス間 import、Public API（`index.ts`）を経由しない import は禁止
  - Inertia の `resolve` は `pages/<slice>` の Public API を読むようにする
- ルールは Steiger（`@feature-sliced/steiger-plugin`）と ESLint で強制する

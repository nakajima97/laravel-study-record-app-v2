# Laravel バージョンアップ・Inertia 移行計画

ゴール: MySQL を 5.7 から 8.0 に、Laravel を 10 から最新（13）に上げ、フロントを Blade + Alpine.js から Inertia.js + React + TypeScript に置き換える。

## リリース

本番へのデプロイは次の 3 回に分ける。

1. テスト・CI 整備と MySQL 8.0 切り替え（ステップ 1〜3）
2. Laravel 13 化（ステップ 4〜5）
3. Inertia + React 化（ステップ 6〜8）

## ブランチ運用

- 統合ブランチ `upgrade/laravel` に直接コミットする（ローカルのみ。push はユーザーがホストからまとめて行う）
- コミットは完了条件を満たした単位で細かく分ける（例: Laravel 1 段ごと、画面 1 つごと）
- リリースの区切りごとに `upgrade/laravel` → `main` の PR を作る（これが本番反映になる）。マージ後は同じブランチで続ける
- PR の説明に、本番環境に関わる変更（デプロイワークフロー、`.env` に必要な作業）をまとめて書く。ユーザーは PR レビューで確認する

## ステップ

### リリース 1: テスト・CI 整備と MySQL 8.0

1. CI と自動デプロイを整備する（Characterization テストを CI で検証できるように、テストより先に行う）
   - CI: PHP 8.3、MySQL 8.0 のサービスコンテナ、PHPUnit、PHPStan、php-cs-fixer
   - `tools/php-cs-fixer` を PHP 8.3 対応版に更新する。それまでは `PHP_CS_FIXER_IGNORE_ENV=1` を付けて実行する
   - `larastan.yaml` の未使用の `tj-actions/changed-files`（2025 年 3 月にサプライチェーン攻撃を受けたアクション）と、lock を書き換える `composer require nunomaduro/larastan --dev` を削除する
   - `actions/checkout` を v4 に上げる
   - `auto-daploy.yaml` がマージされていない PR のクローズでもデプロイしてしまうので、`if: github.event.pull_request.merged == true` を付ける。Node のバージョンも固定する
2. Characterization テストで現状の挙動を固定する
   - Feature テスト: ステータス、リダイレクト先、DB の変化、画面に渡すデータ
   - Playwright の E2E: ログイン、記録の登録、カテゴリーの作成・編集・アーカイブ・並び替え、分析画面の表示
     - CI では `php artisan serve` + MySQL サービスコンテナ + Chromium で実行する
     - 記録の登録は分数の直接入力で行う。ストップウォッチはタイマー依存で不安定なので、モーダルの開閉までにとどめる
   - `/api/category-order` が認証なしで body の `user_id` を信用する現状の挙動は脆弱性なので固定しない（ステップ 4 で直す）
3. 開発環境（`docker-compose.yml`）の MySQL を 8.0 にし、テストが全て通ることを確認する
   - 本番の DB 移行はユーザーがレンタルサーバーの機能で行う（移行前にダンプを取る。接続情報が変わったら本番の `.env` を直す）
   - 移行後、テーブルの照合順序が `utf8mb4_unicode_ci` のまま揃っているか確認する
   - `CLAUDE.md` の環境の記述を MySQL 8.0 に直す

### リリース 2: Laravel 13

4. カテゴリー並び替えを web ルートに移し、Sanctum を外す（Laravel 11 で必要になる Sanctum 4 へのメジャーアップグレードを飛ばすため）
   - `/api/category-order` を `auth` ミドルウェア付きの web ルートにし、`user_id` はリクエストではなくログインユーザーから取る。`drag-move.js` の `fetch` 先を変え、`api/user` の呼び出しをなくす
   - これは仕様変更（未ログインは 302、他人の並び順は書き換え不可）だが承認済み。Characterization テストはこの新しい挙動で書く
   - `routes/api.php`、Sanctum、`EnsureFrontendRequestsAreStateful` を外す。`personal_access_tokens` テーブルはそのまま残す
5. Laravel を 10 → 11 → 12 → 13 と 1 段ずつ上げる。各段で完了条件を満たしてからコミットする（途中の段ではデプロイしない）
   - Laravel 11 のディレクトリ構成（`bootstrap/app.php` への集約、config の差し替え）には移行しない。新構成の config はデフォルトが `SESSION_DRIVER=database` などに変わり、本番の `.env` の修正が必要になるため。既存の `app/Http/Kernel.php` と `config/` を保持する
   - composer.json の `php` を `^8.3` にする
   - `nunomaduro/larastan` を `larastan/larastan` に置き換える。使っていない `laravel/pint` と `laravel/breeze` を外す
   - Vite と `laravel-vite-plugin` を上げる。Tailwind は 3 のまま

### リリース 3: Inertia + React

6. Inertia + React + TypeScript の土台を入れる。Steiger と ESLint を CI に追加する
   - スターターキットは使わずに手で入れる（FSD の構成に合わせるため）
   - ルートヘルパーは Ziggy を使う（`@routes` ディレクティブで実行時に注入する）。デプロイは PHP のない GitHub Actions 上で `npm run build` するため、ビルド時に `php artisan` を必要とする Wayfinder は使えない
7. 画面を 1 つずつ Inertia に移行する。テストは `assertInertia` に書き換える
   - 簡単な画面から移す（例: プロフィール・認証 → ダッシュボード → 記録の登録 → カテゴリー → 分析）
   - 分析画面の Chart.js は CDN ではなく npm パッケージ（`react-chartjs-2`）で使う
   - カテゴリーの並び替えは `fetch` ではなく Inertia の `router` でステップ 4 の web ルートに送る
8. Alpine.js と不要になった Blade を削除する

## 完了条件（各ステップで全て通ること）

- PHPUnit（Characterization テスト含む）
- PHPStan、php-cs-fixer
- tsc、ESLint、Steiger（ステップ 6 以降）
- Playwright E2E

Characterization テストが固定するのはユーザー視点の振る舞い（URL、ステータス、表示テキスト、DB の結果）である。テストを通すためにこれらの期待値を変えてはいけない。変える必要がある場合は仕様変更なので止まって確認する。

E2E のセレクターは role / label / テキストで書き、DOM 構造に依存させない。Blade → React で DOM が変わることによるセレクターの書き換えは期待値の変更に当たらない。

## 確認なしで進めてよいこと

- `upgrade/laravel` へのコミット
- パッケージの追加・更新
- テストの追加・書き換え（上記の期待値の制約は守る）
- 開発環境と CI の MySQL を 8.0 にすること（ステップ 3）
- CI・デプロイワークフロー（`.github/workflows/`）の修正。内容は PR の説明に書く
- ステップ 4 のカテゴリー並び替えの仕様変更（承認済み）

## 必ず止まって確認すること

- push、PR 作成、`main` へのマージ（いずれもユーザーが行う）
- 上記以外で仕様（画面の挙動やデータ）を変えないと解決できない問題
- 本番の環境（PHP、MySQL、`deploy.sh`、`.env`）の変更が必要になったとき

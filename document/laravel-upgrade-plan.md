# Laravel バージョンアップ・Inertia 移行計画

ゴール: MySQL を 5.7 から 8 に、Laravel を 10 から最新（13）に上げ、フロントを Blade + Alpine.js から Inertia.js + React + TypeScript に置き換える。

## リリース

本番へのデプロイは次の 3 回に分ける。

1. MySQL 8 への切り替え（ステップ 1〜3）
2. Laravel 13 化（ステップ 4）
3. Inertia + React 化（ステップ 5〜7）

## ブランチ運用

- 統合ブランチ `upgrade/laravel` に直接コミットする（ローカルのみ。push はユーザーがホストからまとめて行う）
- コミットは完了条件を満たした単位で細かく分ける（例: Laravel 1 段ごと、画面 1 つごと）
- リリースの区切りごとに `upgrade/laravel` → `main` の PR を作る（これが本番反映になる）。マージ後は同じブランチで続ける

## ステップ

### リリース 1: MySQL 8

1. Characterization テストで現状の挙動を固定する
   - Feature テスト: ステータス、リダイレクト先、DB の変化、画面に渡すデータ
   - Playwright の E2E: ログイン、記録の登録、カテゴリーの作成・編集・アーカイブ・並び替え、分析画面の表示
2. CI と自動デプロイを整備する
   - CI: PHP 8.3、MySQL のサービスコンテナ、PHPUnit、PHPStan、php-cs-fixer
   - `tools/php-cs-fixer` を PHP 8.3 対応版に更新する。それまでは `PHP_CS_FIXER_IGNORE_ENV=1` を付けて実行する
   - `auto-daploy.yaml` がマージされていない PR のクローズでもデプロイしてしまうので、`if: github.event.pull_request.merged == true` を付ける。Node のバージョンも固定する
3. 開発環境（`docker-compose.yml`）と CI の MySQL を 8 にし、テストが全て通ることを確認する
   - 本番の DB 移行はユーザーがレンタルサーバーの機能で行う（移行前にダンプを取る。接続情報が変わったら本番の `.env` を直す）
   - 移行後、テーブルの照合順序が `utf8mb4_unicode_ci` のまま揃っているか確認する
   - `CLAUDE.md` の環境の記述を MySQL 8 に直す

### リリース 2: Laravel 13

4. Laravel を 10 → 11 → 12 → 13 と 1 段ずつ上げる。各段で完了条件を満たしてからコミットする（途中の段ではデプロイしない）
   - Laravel 11 のディレクトリ構成（`bootstrap/app.php` への集約）に移行するなら、バージョンアップとは別のコミットにする
   - `nunomaduro/larastan` を `larastan/larastan` に置き換える。使っていない `laravel/pint` と `laravel/breeze` を外す
   - Vite と `laravel-vite-plugin` を上げる。Tailwind は 3 のまま

### リリース 3: Inertia + React

5. Inertia + React + TypeScript の土台を入れる。Steiger と ESLint を CI に追加する
   - スターターキットは使わずに手で入れる（FSD の構成に合わせるため）
   - ルートヘルパー（Ziggy か Wayfinder）をここで決める
6. 画面を 1 つずつ Inertia に移行する。テストは `assertInertia` に書き換える
   - 簡単な画面から移す（例: プロフィール・認証 → ダッシュボード → 記録の登録 → カテゴリー → 分析）
   - 分析画面の Chart.js は CDN ではなく npm パッケージ（`react-chartjs-2`）で使う
   - カテゴリーの並び替えは `fetch` + API（`routes/api.php` の `/category-order`）ではなく Inertia の `router` で web ルートに送る
7. Alpine.js と不要になった Blade を削除する。不要になれば `routes/api.php` と Sanctum も外す

## 完了条件（各ステップで全て通ること）

- PHPUnit（Characterization テスト含む）
- PHPStan、php-cs-fixer
- tsc、ESLint、Steiger（ステップ 5 以降）
- Playwright E2E

テストを通すために Characterization テストの期待値を変えてはいけない。変える必要がある場合は仕様変更なので止まって確認する。

## 確認なしで進めてよいこと

- `upgrade/laravel` へのコミット
- パッケージの追加・更新
- テストの追加・書き換え（上記の期待値の制約は守る）
- 開発環境と CI の MySQL を 8 にすること（ステップ 3）

## 必ず止まって確認すること

- push、PR 作成、`main` へのマージ（いずれもユーザーが行う）
- 仕様（画面の挙動やデータ）を変えないと解決できない問題
- 本番の環境（PHP、MySQL、デプロイスクリプト）の変更が必要になったとき（ステップ 2 の `auto-daploy.yaml` の修正も、変更内容を見せて確認してからコミットする）

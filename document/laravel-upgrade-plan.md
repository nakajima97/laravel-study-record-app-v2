# Laravel バージョンアップ・Inertia 移行計画

ゴール: Laravel 10 を最新（13）に上げ、フロントを Blade + Alpine.js から Inertia.js + React + TypeScript に置き換える。
MySQL のバージョンアップ（5.7 → 8）は対象外。

## ブランチ運用

- 統合ブランチ `upgrade/laravel` に直接コミットする（ローカルのみ。push はユーザーがホストからまとめて行う）
- コミットは完了条件を満たした単位で細かく分ける（例: Laravel 1 段ごと、画面 1 つごと）
- 全ステップ完了後に `upgrade/laravel` → `main` の PR を作る（これが本番反映になる）

## ステップ

1. Characterization テストで現状の挙動を固定する
   - Feature テスト: ステータス、リダイレクト先、DB の変化、画面に渡すデータ
   - 分析画面の集計は Service 単位でも値を固定する
   - Playwright の E2E: ログイン、記録の登録、カテゴリーの作成・編集・アーカイブ・並び替え、分析画面の表示
   - 移行前の画面のスクリーンショットを撮っておく（最終 PR で移行後と比較する）
2. CI を整備する（PHP 8.3、MySQL 5.7 のサービスコンテナ、PHPUnit、PHPStan、php-cs-fixer）
   - `tools/php-cs-fixer` を PHP 8.3 対応版に更新する。それまでは `PHP_CS_FIXER_IGNORE_ENV=1` を付けて実行する
3. Laravel を 10 → 11 → 12 → 13 と 1 段ずつ上げる。各段で完了条件を満たしてからコミットする
4. Inertia + React + TypeScript の土台を入れる。Steiger と ESLint を CI に追加する
5. 画面を 1 つずつ Inertia に移行する。テストは `assertInertia` に書き換える
   - 分析画面の Chart.js は CDN ではなく npm パッケージ（`react-chartjs-2`）で使う
   - カテゴリーの並び替えは `fetch` + API（`routes/api.php` の `/category-order`）ではなく Inertia の `router` で web ルートに送る
6. Alpine.js と不要になった Blade を削除する

## 完了条件（各ステップで全て通ること）

- PHPUnit（Characterization テスト含む）
- PHPStan、php-cs-fixer
- tsc、ESLint、Steiger（ステップ 4 以降）
- Playwright E2E

テストを通すために Characterization テストの期待値を変えてはいけない。変える必要がある場合は仕様変更なので止まって確認する。

## 確認なしで進めてよいこと

- `upgrade/laravel` へのコミット
- パッケージの追加・更新
- テストの追加・書き換え（上記の期待値の制約は守る）

## 必ず止まって確認すること

- push、PR 作成、`main` へのマージ（いずれもユーザーが行う）
- 仕様（画面の挙動やデータ）を変えないと解決できない問題
- 本番の環境（PHP、MySQL、デプロイスクリプト）の変更が必要になったとき

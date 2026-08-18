# VRCギミック技術情報プラットフォーム

VRChatのギミック情報をWix/Veloで一覧・検索・閲覧するためのサイトコードです。

## 現在コードで確認できる機能

- `GimmickInfo` の一覧取得と10件単位のページング
- タイトル・本文のキーワード検索
- `gimmickCategory` による絞り込み
- 動的詳細ページでのギミック表示
- 同一カテゴリの関連ギミック取得
- backendでの入力検証と画像処理を経た `GimmickInfo` 登録

実装の中心は `src/pages/ホーム.o4xsf.js`、`src/dynamicPages/gimmick-detail.js`、`src/backend/gimmick-service.jsw` です。

## 検証上の境界

このrepositoryのソースコードだけでは、Wix上の現在の公開URL、CMS内の実データ件数、production deployment、投稿権限、実ブラウザでの動作は証明できません。これらはWixのdeployment/runtime evidenceが得られるまで未検証として扱います。

また、制作者profile、導入相談、案件紹介、決済などのmarketplace機能は現在の実装にはありません。

## 開発

Wix公式のGit Integration & Wix CLI for Sitesを利用します。

```bash
npm install
npm run dev
```

品質確認:

```bash
npm run lint
```

`npm install` の `postinstall` では `wix sync-types` が実行されます。Wix siteへ接続した開発環境が必要です。

## 構成

- `src/backend/` — Wix data access、validation、image processing
- `src/dynamicPages/` — ギミック詳細ページ
- `src/pages/` — Wix page code
- `src/public/scripts/` — frontendから再利用するscripts
- `wix.config.json` / `wix-dev.config.js` — Wix CLI設定

## Deploy

Wix接続済み環境では、現在のpackage/toolingに沿ってWix CLIからdeploymentを行います。production deploymentはGitHub上のsourceだけでは検証済みとみなしません。

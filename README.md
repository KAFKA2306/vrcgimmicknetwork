# VRCギミック技術情報プラットフォーム

## アーキテクチャ概要
```
src/
├── backend/            # コアビジネスロジック
├── dynamicPages/       # 動的ページ実装
├── public/
│   ├── images/         # 最適化済画像リソース
│   └── scripts/        # クライアントサイドスクリプト
└── pages/              # 主要ページ実装
```

## 開発環境構築
```
npm install -g @wix/cli
git clone git@github.com:KAFKA2306/vrcgimmicknetwork.git
cd vrcgimmicknetwork
npm install
wix dev
```

## デプロイコマンド
```
wix deploy --prod

# VRCギミック技術情報プラットフォーム

## 1. プロジェクト概要

### 1.1 プロジェクト名
VRCギミック技術情報プラットフォーム

### 1.2 背景と目的
VRChatにおけるアバターおよびワールドのギミック開発は、Unity、UdonSharp、アニメーション、シェーダーなど多岐にわたる知識と技術を必要とします。しかし、特に日本語で体系的にまとめられた情報は依然として不足しており、初心者から中級者が直面する「暗黙の了解」や特有の仕様の解決が困難な状況です。
本プロジェクトは、これらの課題を解決するため、VRChatのギミック開発に関する実践的な知識、Tips、トラブルシューティング情報などを集約し、誰もが容易にアクセスし、また情報を**即時公開で投稿できる**日本語の技術情報プラットフォームを構築することを目的とします。

### 1.3 スコープ
*   VRChatのギミック開発（Udon, UdonSharp, Animator, シェーダー等）に関する技術情報の**ユーザーによる投稿（即時公開）**・閲覧・検索機能の提供。
*   アバターギミック、ワールドギミック、最適化Tipsなど、関連する幅広い情報の集約。
*   **プラットフォーム**: Wix.com をCMSとして採用し、Velo by Wix を用いたカスタム開発を実施。
*   **バージョン管理**: GitおよびGitHub (`KAFKA2306/vrcgimmicknetwork`) を使用。
*   **開発環境**: VSCode と Wix CLI (`wix dev`) を用いたローカル開発。

## 2. 対象ユーザー

*   VRChatのワールド制作者およびアバター改変を行うユーザー全般。
*   ギミック開発に着手したばかりの初心者から、特定の問題解決や技術向上を目指す中級者。
*   自身の知識や経験をコミュニティに即座に共有したい上級者。

## 3. システム構成

### 3.1 インフラストラクチャ
*   **ホスティング**: Wix.com フルマネージドホスティング
*   **データベース**: Wixコンテンツマネージャー
*   **ドメイン**: Wix提供サブドメイン (`https://ag1i5rer.wixsite.com/my-site`)
*   **SSL証明書**: Wixにより自動提供・管理
*   **CDN**: WixグローバルCDN

### 3.2 ソフトウェアスタック
*   **CMS**: Wix.com (ビジュアルエディタ + Velo by Wix)
*   **フロントエンド**: Wixレンダリングエンジン, HTML, CSS, JavaScript (Velo)
*   **バックエンド**: Velo by Wix (Node.jsベースのサーバーレス環境)
*   **コードエディタ**: VSCode (Wix CLI連携)

### 3.3 プロジェクトディレクトリ構造 (ローカル開発)
```
vrcgimmicknetwork/
├── src/
│   ├── backend/
│   │   ├── gimmick-service.js      # ギミックデータ操作ロジック
│   │   ├── content-validator.js    # コンテンツバリデーション
│   │   └── image-optimizer.js      # 画像最適化処理
│   ├── dynamicPages/
│   │   └── gimmick-detail.js       # ギミック詳細表示ページ (動的)
│   ├── pages/
│   │   ├── main-home.js            # トップページ (旧 ホーム.o4xsf.js)
│   │   └── submit-gimmick.js       # ギミック投稿フォームページ
│   └── public/
│       ├── scripts/
│       │   ├── code-utils.js       # コードハイライト等の共通スクリプト
│       │   └── ui-components.js    # UIコンポーネント生成スクリプト
│       ├── images/                 # デフォルト画像などの静的画像
│       └── styles/                 # (必要に応じて共通CSS)
├── wix-dev.config.js               # (Wix CLI設定ファイル)
├── package.json
└── README.md                       # プロジェクト説明、開発手順
```

## 4. データ構造・コンテンツ設計 (Wixコンテンツマネージャー)

### 4.1 コレクション定義
*   **`GimmickInfo`**: VRChatギミックに関する主要技術情報。
    *   **フィールド (主なもの)**:
        *   `title` (テキスト, 必須): 記事タイトル
        *   `content` (リッチテキスト, 必須): 記事本文 (HTML形式でコードスニペット含む)
        *   `mainImage` (画像): アイキャッチ画像
        *   `unityVersion` (テキスト): Unityバージョン (例: "2019.4.31f1")
        *   `sdkVersion` (テキスト): VRC SDKバージョン (例: "VRCSDK3-AVATAR-2023.10.11")
        *   `target` (タグ): 対象 (例: ["ワールド", "アバター"])
        *   `difficulty` (テキスト, 単一選択): 難易度 (例: "初心者向け", "中級者向け", "上級者向け")
        *   `prerequisites` (リッチテキスト): 前提知識・依存アセット
        *   `environment` (テキスト): 動作確認環境
        *   `gimmickCategory` (タグ, 複数選択可): カテゴリ (例: ["Udonギミック", "シェーダー"])
        *   `gimmickTag` (タグ, 複数選択可): タグ (例: ["ミラー", "同期処理"])
        *   `_owner` (テキスト, Wix自動): アイテム作成者のユーザーID (Wix会員機能利用時)
        *   `submitterName` (テキスト): 投稿者名 (非会員投稿の場合や、会員名とは別名希望の場合)
        *   `submitterEmail` (テキスト, 非公開): 投稿者の連絡用メールアドレス
        *   `isFlagged` (ブール値, 任意, 初期値: false): 不適切コンテンツとして報告されたかどうかのフラグ
        *   `reportCount` (数値, 任意, 初期値: 0): 報告された回数
        *   `_createdDate` (日付と時刻, Wix自動): 投稿日
        *   `_updatedDate` (日付と時刻, Wix自動): 更新日
*   **`Announcements` (任意)**: お知らせ、運営情報。
    *   フィールド: `title`, `content`, `_createdDate` など。

### 4.2 カテゴリ・タグの運用
*   `GimmickInfo` コレクションの `gimmickCategory` および `gimmickTag` フィールドをWixの「タグ」フィールドタイプとして設定。
*   これにより、複数選択可能で柔軟な分類を実現。Veloコードでこれらのタグを元にフィルタリングや一覧表示を行う。

## 5. 主要機能仕様

### 5.1 コンテンツ投稿・編集機能
*   **ユーザー投稿機能（即時公開）**:
    *   **投稿フォームページ (`submit-gimmick.js`)**: サイト上に専用の投稿フォームページを設置。ユーザーはWixフォーム経由でギミック情報を入力・送信。
        *   入力項目: タイトル、本文（リッチテキストエディタまたはMarkdown入力）、カテゴリ、タグ、Unityバージョン、SDKバージョン、対象、難易度、アイキャッチ画像アップロードなど。
    *   **コレクション権限**: `GimmickInfo` コレクションの「コンテンツを収集」権限を「**フォームの解答**」に設定（Wix会員ログイン不要で投稿可）または「**サイト会員**」（ログインユーザーのみ投稿可）に設定。
    *   **投稿データの保存と即時公開**: フォームから送信されたデータは、Veloのバックエンド関数（`gimmick-service.js` 内の `createGimmick`）を通じてバリデーション後、`GimmickInfo` コレクションに**即座に保存され、サイト上に公開**される。
    *   **ファイルアップロード**: アイキャッチ画像はWixフォームのアップロードボタンを使用し、Wixメディアマネージャーに保存。
*   **編集と削除**:
    *   **運営者**: Wixコンテンツマネージャーから全ての記事を編集・削除可能。
    *   **投稿者 (将来検討)**: ログインしている場合、自分の投稿（`_owner` が一致する場合）を一定期間内であれば編集・削除できる機能を検討。

### 5.2 コンテンツ閲覧・検索機能 (Velo by Wixで実装)
*   **トップページ (`main-home.js`)**:
    *   最新のギミック情報10件をカード形式で一覧表示 (`ui-components.js` の `renderGimmickCard` を利用)。
    *   カテゴリドロップダウンによる絞り込み機能。
    *   キーワード検索ボックスと検索ボタンによる全文検索機能（タイトル、本文対象）。
*   **ギミック詳細ページ (`gimmick-detail.js`, 動的ページ)**:
    *   URL形式: `/gimmick-info/{GimmickInfo._id}` または `/gimmick-info/{GimmickInfo.title}` (SEOフレンドリーなURL)
    *   記事タイトル、本文、各種メタ情報（Unityバージョン、難易度など）を表示。
    *   技術仕様をまとめたカード表示。
    *   本文中のコードスニペットを `code-utils.js` (highlight.js等を利用) でシンタックスハイライト表示（行番号、コピーボタン付き）。
    *   関連ギミック情報（同一カテゴリなど）を5件表示。
*   **カテゴリ/タグ別一覧ページ (将来的に実装)**:
    *   特定のカテゴリやタグに属するギミック情報の一覧を動的ページまたは通常ページ+Veloで表示。
    *   ページネーション機能 (`ui-components.js` の `renderPagination` を利用)。

### 5.3 ユーザーインタラクション機能
*   **コメント機能**: Wix標準の「Wixブログ」アプリのコメント機能、または外部コメントシステム（Disqusなど）の埋め込みを検討。
*   **トップに戻るボタン**: `ui-components.js` の `setupBackToTopButton` で実装。

## 6. UI/UX設計指針

*   **テーマカラー**: VRChat公式イメージカラー（ブルー系）や、技術情報サイトに適したダークテーマまたはクリーンなライトテーマを基調とする。アクセントカラーを効果的に使用。
*   **レスポンシブデザイン**: Wixエディタのレスポンシブ機能を最大限に活用し、PC、タブレット、スマートフォンで最適表示。
*   **ナビゲーション**: ヘッダーに主要な導線（トップ、カテゴリ一覧、タグ一覧、ギミック投稿フォーム、検索など）を配置。
*   **可読性**:
    *   フォント: ゴシック体ベースのウェブフォントを選定。本文16px以上、行間1.6～1.8。
    *   コード表示: 等幅フォント、シンタックスハイライト、背景色とのコントラストを確保。
*   **投稿フォームのユーザビリティ**:
    *   入力項目を分かりやすくグループ化し、必須項目を明示。
    *   入力例やガイドテキストを提供。
    *   リッチテキストエディタやMarkdownプレビュー機能で本文作成を支援。
    *   画像アップロードのファイル形式やサイズ制限を明記。
    *   送信後の確認メッセージやサンキューページを明確に表示。

## 7. 開発フロー

1.  **Wixコンテンツマネージャー**:
    *   `GimmickInfo` コレクションのスキーマ定義（`isFlagged` 等の追加フィールド含む）。
    *   コレクションの「権限・プライバシー」設定で、「コンテンツを収集」権限を適切に設定（例: 「フォームの解答」）。
2.  **Wixエディタ**:
    *   基本ページ（ホーム、動的ページテンプレート、**ギミック情報投稿フォームページ**）の作成。
    *   UI要素（リピーター、ドロップダウン、テキストボックス、ボタン、Wixフォーム等）の配置とID設定。
    *   サイトデザイン（テーマカラー、フォント、レスポンシブ設定）。
3.  **VSCode (ローカル開発)**:
    *   `src` ディレクトリ以下にVeloコード（`.js` ファイル）を実装・編集。
        *   投稿フォームページ (`submit-gimmick.js`) のVeloコードで、入力値の取得、`gimmick-service.js` への送信処理、送信後のメッセージ表示などを実装。
        *   `gimmick-service.js` に、投稿データを受け取り、バリデーション後に**即時公開状態で保存**する関数を実装または拡張。
        *   不適切コンテンツ報告機能のバックエンド処理を実装。
    *   `wix dev` コマンドでローカルサーバーを起動し、Wixエディタとリアルタイム同期。
    *   ブラウザで動作確認とデバッグ（特に投稿フォームの動作と即時公開の確認）。
4.  **Git & GitHub**:
    *   変更内容をローカルで `git commit`。
    *   `git push origin main` でGitHubリモートリポジトリにプッシュ。
5.  **Wixエディタ**:
    *   最終的な表示確認。
    *   サイトを「公開」。

## 8. テスト・運用・保守計画

### 8.1 テスト計画
*   **ユニットテスト (Velo)**: 主要なバックエンド関数 (`gimmick-service.js`, `content-validator.js` 等) に対するテストケース作成。
*   **機能テスト**: VeloコードとUI要素の連携、データ表示、フィルタリング、検索、ページ遷移、**ユーザー投稿フロー（入力・送信・即時表示）**、**不適切コンテンツ報告フロー**など全主要機能の動作確認。
*   **表示テスト**: 主要ブラウザ (Chrome, Firefox, Edge, Safari)、主要デバイス (PC, iOS, Android) での表示崩れ・操作性確認。
*   **セキュリティテスト**: スパム投稿の試行、意図的な不正入力の試行など。

## 9. 参考初期カテゴリ・タグ例 (再掲)

### カテゴリ (`gimmickCategory` の値の例)
Udonギミック, アバター改変, ワールド最適化, トラブルシューティング, 衣装改変, シェーダー, アニメーション, ツール紹介, パフォーマンス改善, イベント設営Tips

### タグ (`gimmickTag` の値の例)
ミラー, スイッチ, 同期, Modular Avatar, lilToon, Poiyomi Toon Shader, VRM, Unity2022, VRCSDK3, Quest対応, パーティクル, 最適化, PhysBones, UdonSharp, CyanTrigger

## 10. 実現スケジュール (目標)

1.  **Week 1-2: 基盤構築とコア機能**
    *   Wixサイトセットアップ、Wix会員機能有効化（任意だが推奨）。
    *   `GimmickInfo` コレクション定義（モデレーション用フィールド含む）、権限設定（フォームからの直接書き込み許可）。
    *   GitHub連携とローカル開発環境の完全整備。
    *   **ギミック情報投稿フォーム (`submit-gimmick.js`) の基本UI作成と、Veloによる投稿データ保存処理（即時公開）の実装。**
    *   トップページ (`main-home.js`): 新着表示、カテゴリフィルタ、検索機能の基本実装。
    *   詳細ページ (`gimmick-detail.js`): 基本情報表示、コードハイライト機能の実装。
    *   利用規約、投稿ガイドライン、プライバシーポリシーページの作成。
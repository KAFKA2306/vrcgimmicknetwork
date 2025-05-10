import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    // 初期表示：最新のギミック情報を読み込む
    loadLatestGimmicks();
    
    // カテゴリフィルター機能
    initializeCategoryFilter();
    
    // 検索機能
    initializeSearchFunction();
    
    // UIコンポーネントの初期状態設定
    setupUIComponents();
});

// 最新のギミック情報を読み込み表示する関数
async function loadLatestGimmicks() {
    try {
        const results = await wixData.query("GimmickInfo")
            .descending("_createdDate")
            .limit(10)  // 仕様書5.2.1に基づき10件表示
            .find();
            
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();  // 「結果がありません」メッセージを非表示
        } else {
            $w("#gimmickRepeater").collapse();  // リピーターを非表示
            $w("#noResultsMessage").expand();   // 「結果がありません」メッセージを表示
        }
    } catch (error) {
        console.error("ギミック情報の読み込みに失敗しました:", error);
        showErrorMessage();
    }
}

// カテゴリフィルター機能の初期化
function initializeCategoryFilter() {
    // カテゴリドロップダウンの選択肢を動的に設定
    const categoryDropdown = $w("#categoryDropdown");
    
    if (categoryDropdown) {
        // カテゴリの変更イベントを監視
        categoryDropdown.onChange(() => {
            const selectedCategory = categoryDropdown.value;
            
            if (!selectedCategory || selectedCategory === "all") {
                // 「すべて」が選択された場合は最新の記事を表示
                loadLatestGimmicks();
            } else {
                // 選択されたカテゴリでフィルタリング
                filterByCategory(selectedCategory);
            }
        });
        
        // カテゴリ一覧を取得して選択肢を設定
        loadCategories();
    }
}

// カテゴリ一覧を取得しドロップダウンに設定
async function loadCategories() {
    try {
        // リンク: カテゴリ相当の情報を取得するクエリ
        // VeloではWixのタグ/カテゴリ機能をどう使うかによって実装が変わる
        // 以下はGimmickInfoコレクションからユニークなカテゴリを抽出する方法の例
        const results = await wixData.query("GimmickInfo")
            .limit(1000)
            .find();
            
        // ユニークなカテゴリのセットを作成
        const uniqueCategories = new Set();
        results.items.forEach(item => {
            if (item.gimmickCategory) {
                // gimmickCategoryがタグ形式（配列）の場合
                if (Array.isArray(item.gimmickCategory)) {
                    item.gimmickCategory.forEach(cat => uniqueCategories.add(cat));
                } else {
                    // 文字列の場合
                    uniqueCategories.add(item.gimmickCategory);
                }
            }
        });
        
        // ドロップダウン用のオプション配列を作成
        const options = [
            { label: "すべてのカテゴリ", value: "all" }
        ];
        
        uniqueCategories.forEach(category => {
            options.push({ label: category, value: category });
        });
        
        // ドロップダウンにオプションを設定
        $w("#categoryDropdown").options = options;
        
    } catch (error) {
        console.error("カテゴリの読み込みに失敗しました:", error);
    }
}

// カテゴリでフィルタリング
async function filterByCategory(category) {
    try {
        let query = wixData.query("GimmickInfo");
        
        // カテゴリフィールドが配列かどうかで検索方法を変える
        // 実際のデータ構造に合わせて調整が必要
        query = query.contains("gimmickCategory", category);
        
        const results = await query
            .descending("_createdDate")
            .limit(10)
            .find();
            
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
        }
    } catch (error) {
        console.error(`カテゴリ「${category}」でのフィルタリングに失敗しました:`, error);
        showErrorMessage();
    }
}

// 検索機能の初期化
function initializeSearchFunction() {
    const searchButton = $w("#searchButton");
    const searchInput = $w("#searchInput");
    
    if (searchButton && searchInput) {
        // 検索ボタンのクリックイベント
        searchButton.onClick(() => {
            const keyword = searchInput.value;
            if (keyword && keyword.trim() !== "") {
                searchGimmicks(keyword.trim());
            } else {
                // キーワードが空の場合は最新の記事を表示
                loadLatestGimmicks();
            }
        });
        
        // Enterキーでも検索実行
        searchInput.onKeyPress((event) => {
            if (event.key === "Enter") {
                const keyword = searchInput.value;
                if (keyword && keyword.trim() !== "") {
                    searchGimmicks(keyword.trim());
                }
            }
        });
    }
}

// キーワードでギミック情報を検索
async function searchGimmicks(keyword) {
    try {
        // タイトルと本文にキーワードが含まれるアイテムを検索
        const results = await wixData.query("GimmickInfo")
            .contains("title", keyword)
            .or(
                wixData.query("GimmickInfo")
                    .contains("content", keyword)
            )
            .descending("_createdDate")
            .limit(10)
            .find();
            
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = `「${keyword}」に一致する情報は見つかりませんでした。`;
        }
    } catch (error) {
        console.error(`「${keyword}」での検索に失敗しました:`, error);
        showErrorMessage();
    }
}

// ギミック情報をリピーターに表示
function displayGimmickItems(items) {
    const repeater = $w("#gimmickRepeater");
    
    if (repeater) {
        repeater.data = items;
        repeater.expand();
        
        // リピーター内の各アイテムをカスタマイズ
        repeater.onItemReady(($item, itemData) => {
            // タイトル設定
            $item("#itemTitle").text = itemData.title;
            
            // 詳細ページへのリンク設定
            $item("#itemLink").onClick(() => {
                // 'gimmick-info'はダイナミックページのプレフィックス。実際の設定に合わせて調整
                wixLocation.to(`/gimmick-info/${itemData._id}`);
            });
            
            // アイキャッチ画像設定（存在する場合）
            if (itemData.mainImage) {
                $item("#itemImage").src = itemData.mainImage;
            } else {
                // デフォルト画像を設定
                $item("#itemImage").src = "https://static.wixstatic.com/media/nsplsh_YOUR_DEFAULT_IMAGE.jpg";
            }
            
            // カテゴリとタグの表示
            if (itemData.gimmickCategory) {
                let categoryText = Array.isArray(itemData.gimmickCategory) 
                    ? itemData.gimmickCategory.join(", ") 
                    : itemData.gimmickCategory;
                $item("#itemCategory").text = `カテゴリ: ${categoryText}`;
            }
            
            // 難易度の表示と色設定
            if (itemData.difficulty) {
                $item("#itemDifficulty").text = `難易度: ${itemData.difficulty}`;
                
                // 難易度によって色を変更
                switch(itemData.difficulty) {
                    case "初心者向け":
                        $item("#itemDifficulty").style.color = "#4CAF50"; // 緑
                        break;
                    case "中級者向け":
                        $item("#itemDifficulty").style.color = "#FFC107"; // 黄色
                        break;
                    case "上級者向け":
                        $item("#itemDifficulty").style.color = "#F44336"; // 赤
                        break;
                }
            }
            
            // 投稿日の表示
            if (itemData._createdDate) {
                const date = new Date(itemData._createdDate);
                $item("#itemDate").text = `投稿日: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
            }
        });
    }
}

// UI要素の初期設定
function setupUIComponents() {
    // ページタイトルの設定
    $w("#pageTitle").text = "VRCギミック技術情報プラットフォーム";
    
    // ヘッダーメニューのアクティブ項目設定
    $w("#homeMenuItem").classList.add("active");
    
    // 結果がない場合のメッセージ初期設定
    $w("#noResultsMessage").text = "表示できるギミック情報がありません。";
    $w("#noResultsMessage").collapse();
}

// エラーメッセージの表示
function showErrorMessage() {
    $w("#gimmickRepeater").collapse();
    $w("#noResultsMessage").text = "情報の読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。";
    $w("#noResultsMessage").expand();
}

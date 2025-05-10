import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { GimmickService } from 'backend/gimmick-service';
import { highlight } from 'public/scripts/code-utils';

$w.onReady(function () {
    // ページタイトルと初期コンテンツの設定
    $w("#pageTitle").text = "VRCギミック技術情報プラットフォーム";
    
    // 最新ギミック情報の読み込み
    loadLatestGimmicks();
    
    // カテゴリフィルター初期化
    initializeCategoryFilter();
    
    // 検索機能初期化
    initializeSearchFunction();
});

// 最新のギミック情報を読み込んで表示
async function loadLatestGimmicks() {
    try {
        const results = await wixData.query("GimmickInfo")
            .descending("_createdDate")
            .limit(10)  // 仕様書5.2.1に基づき10件表示
            .find();
            
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = "表示できるギミック情報がありません。";
        }
    } catch (error) {
        console.error("ギミック情報の読み込みに失敗しました:", error);
        showErrorMessage("データの読み込みに失敗しました。時間をおいて再度お試しください。");
    }
}

// カテゴリフィルター機能
function initializeCategoryFilter() {
    // カテゴリリストを動的に取得
    loadCategories();
    
    // カテゴリ選択イベント
    $w("#categoryDropdown").onChange(() => {
        const selectedCategory = $w("#categoryDropdown").value;
        
        if (!selectedCategory || selectedCategory === "all") {
            loadLatestGimmicks();
        } else {
            filterByCategory(selectedCategory);
        }
    });
}

// カテゴリ一覧取得とドロップダウン設定
async function loadCategories() {
    try {
        // GimmickInfoコレクションから一意のカテゴリを取得
        const results = await wixData.query("GimmickInfo")
            .limit(1000)
            .find();
            
        // 一意のカテゴリセット作成
        const categories = new Set();
        
        results.items.forEach(item => {
            if (item.gimmickCategory) {
                if (Array.isArray(item.gimmickCategory)) {
                    item.gimmickCategory.forEach(cat => categories.add(cat));
                } else {
                    categories.add(item.gimmickCategory);
                }
            }
        });
        
        // ドロップダウンオプション作成
        const options = [
            { label: "すべてのカテゴリ", value: "all" }
        ];
        
        categories.forEach(category => {
            options.push({ label: category, value: category });
        });
        
        // ドロップダウンに設定
        $w("#categoryDropdown").options = options;
        
    } catch (error) {
        console.error("カテゴリの読み込みに失敗しました:", error);
    }
}

// カテゴリでフィルタリング
async function filterByCategory(category) {
    try {
        const results = await wixData.query("GimmickInfo")
            .hasSome("gimmickCategory", [category])
            .descending("_createdDate")
            .limit(10)
            .find();
            
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = `「${category}」に該当するギミック情報はありません。`;
        }
    } catch (error) {
        console.error(`カテゴリ「${category}」でのフィルタリングに失敗しました:`, error);
        showErrorMessage("フィルタリング中にエラーが発生しました。");
    }
}

// 検索機能の初期化
function initializeSearchFunction() {
    // 検索ボタンクリックイベント
    $w("#searchButton").onClick(() => {
        const keyword = $w("#searchInput").value;
        if (keyword && keyword.trim() !== "") {
            searchGimmicks(keyword.trim());
        } else {
            loadLatestGimmicks();
        }
    });
    
    // Enterキーでの検索
    $w("#searchInput").onKeyPress((event) => {
        if (event.key === "Enter") {
            const keyword = $w("#searchInput").value;
            if (keyword && keyword.trim() !== "") {
                searchGimmicks(keyword.trim());
            }
        }
    });
}

// キーワード検索
async function searchGimmicks(keyword) {
    try {
        const results = await wixData.query("GimmickInfo")
            .contains("title", keyword)
            .or(wixData.query("GimmickInfo").contains("content", keyword))
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
        showErrorMessage("検索中にエラーが発生しました。");
    }
}

// ギミック情報をリピーターに表示
function displayGimmickItems(items) {
    const repeater = $w("#gimmickRepeater");
    
    repeater.data = items;
    repeater.expand();
    
    // リピーター内の各アイテムをカスタマイズ
    repeater.onItemReady(($item, itemData) => {
        // タイトル設定
        $item("#itemTitle").text = itemData.title;
        
        // 詳細ページへのリンク設定
        $item("#itemLink").onClick(() => {
            wixLocation.to(`/gimmick-info/${itemData._id}`);
        });
        
        // アイキャッチ画像設定
        if (itemData.mainImage) {
            $item("#itemImage").src = itemData.mainImage;
            $item("#itemImage").alt = itemData.title;
        } else {
            // デフォルト画像設定
            $item("#itemImage").src = "/images/default-gimmick.webp";
        }
        
        // カテゴリ表示
        if (itemData.gimmickCategory) {
            let categoryText = Array.isArray(itemData.gimmickCategory) 
                ? itemData.gimmickCategory.join(", ") 
                : itemData.gimmickCategory;
            $item("#itemCategory").text = `カテゴリ: ${categoryText}`;
        }
        
        // 難易度表示と色設定
        if (itemData.difficulty) {
            $item("#itemDifficulty").text = `難易度: ${itemData.difficulty}`;
            
            // 難易度に応じた色設定
            switch(itemData.difficulty) {
                case "初心者向け":
                    $item("#itemDifficulty").style.color = "#4CAF50"; // 緑
                    break;
                case "中級者向け":
                    $item("#itemDifficulty").style.color = "#FFC107"; // 黄
                    break;
                case "上級者向け":
                    $item("#itemDifficulty").style.color = "#F44336"; // 赤
                    break;
            }
        }
        
        // 投稿日表示
        if (itemData._createdDate) {
            const date = new Date(itemData._createdDate);
            $item("#itemDate").text = `投稿日: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }
    });
}

// エラーメッセージ表示
function showErrorMessage(message) {
    $w("#gimmickRepeater").collapse();
    $w("#noResultsMessage").text = message;
    $w("#noResultsMessage").expand();
}

import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { GimmickService } from 'backend/gimmick-service'; // バックエンドサービス
import { renderGimmickCard, renderPagination, setupBackToTopButton } from 'public/scripts/ui-components'; // UIコンポーネント関数

const ITEMS_PER_PAGE = 10;

$w.onReady(function () {
    const pageTitle = $w("#pageTitle");
    const noResultsMessage = $w("#noResultsMessage");
    const categoryDropdown = $w("#categoryDropdown");
    const searchButton = $w("#searchButton");
    const searchInput = $w("#searchInput");
    const gimmickRepeater = $w("#gimmickRepeater");
    const paginationContainer = $w("#paginationContainer");

    pageTitle.text = "VRCギミック技術情報";

    loadGimmicksWithPagination(1);
    initializeCategoryFilter();
    initializeSearchFunction();
    setupBackToTopButton();

    noResultsMessage.collapse();
});

async function loadGimmicksWithPagination(pageNumber, category = null, keyword = null) {
    try {
        // GimmickService経由でデータを取得
        const options = {
            limit: ITEMS_PER_PAGE,
            skip: (pageNumber - 1) * ITEMS_PER_PAGE,
            category: (category && category !== "all") ? category : null,
            // keyword は GimmickService.searchGimmicks が内部で処理するので、ここでは直接渡さない
        };

        let results;
        if (keyword) {
            results = await GimmickService.searchGimmicks(keyword, options);
        } else {
            results = await GimmickService.getGimmicks(options); // カテゴリフィルタはgetGimmicks内で対応も可、または専用関数
            // もしGimmickService.getGimmicksがカテゴリフィルタをサポートしないなら、別途フィルタリングロジックをここかServiceに追加
             if (options.category) { // ここで暫定的にフィルタリング
                const allItems = await GimmickService.getGimmicks({ limit: 1000 }); // 全件取得は非効率なので注意
                const filteredItems = allItems.items.filter(item => 
                    item.gimmickCategory && (Array.isArray(item.gimmickCategory) ? item.gimmickCategory.includes(options.category) : item.gimmickCategory === options.category)
                );
                results = { // results オブジェクトの構造を模倣
                    items: filteredItems.slice(options.skip, options.skip + options.limit),
                    totalCount: filteredItems.length // 正確な総数は別途取得が必要
                };
                // 注: 上記のカテゴリフィルタは非効率です。GimmickService側で対応するのが望ましい。
            }
        }


        const totalPages = Math.ceil((results.totalCount || results.items.length) / ITEMS_PER_PAGE); // totalCountが返される前提

        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            const paginationHtml = renderPagination(pageNumber, totalPages, wixLocation.baseUrl + wixLocation.path.join('/')); // URL生成を修正
            if (paginationContainer.html !== undefined) { // WixのHTMLコンポーネントの場合
                 paginationContainer.html = paginationHtml;
            } else if (paginationContainer.text !== undefined) { // テキストボックスの場合
                 paginationContainer.text = "ページネーション非対応コンテナです"; // 適切な表示方法に変更
            }
            noResultsMessage.collapse();
            paginationContainer.expand();
        } else {
            gimmickRepeater.collapse();
            paginationContainer.collapse();
            noResultsMessage.text = keyword ? `「${keyword}」に一致する情報は見つかりませんでした。` : "表示できるギミック情報がありません。";
            noResultsMessage.expand();
        }
    } catch (error) {
        console.error("ギミック情報の読み込みに失敗しました:", error);
        showErrorMessage("データの読み込みに失敗しました。");
    }
}

async function initializeCategoryFilter() {
    const categoryDropdown = $w("#categoryDropdown");
    if (!categoryDropdown) {
        console.warn("要素 #categoryDropdown がページに見つかりません。");
        return;
    }
    try {
        const categories = await GimmickService.getCategories();
        const options = [{ label: "すべてのカテゴリ", value: "all" }];
        categories.sort().forEach(cat => {
            options.push({ label: cat, value: cat });
        });
        categoryDropdown.options = options;

        categoryDropdown.onChange(() => {
            const selectedCategory = categoryDropdown.value;
            const currentKeyword = $w("#searchInput").value || null;
            loadGimmicksWithPagination(1, selectedCategory, currentKeyword);
        });
    } catch (error) {
        console.error("カテゴリの読み込みまたは設定に失敗しました:", error);
    }
}

function initializeSearchFunction() {
    const searchButton = $w("#searchButton");
    const searchInput = $w("#searchInput");
    if (!searchButton || !searchInput) {
        console.warn("検索関連要素が見つかりません。");
        return;
    }
    const performSearch = () => {
        const keyword = searchInput.value.trim();
        const currentCategory = $w("#categoryDropdown").value || "all";
        loadGimmicksWithPagination(1, currentCategory, keyword || null);
    };
    searchButton.onClick(performSearch);
    searchInput.onKeyPress((event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });
}

function displayGimmickItems(items) {
    const repeater = $w("#gimmickRepeater");
    if (!repeater) {
        console.warn("要素 #gimmickRepeater がページに見つかりません。");
        return;
    }
    repeater.data = items.map(item => {
        // ui-components.js の renderGimmickCard は、itemData全体とオプションを引数に取ることを想定
        // また、HTML文字列を返すことを想定
        const cardHtml = renderGimmickCard(item, {
            showImage: true,
            showCategory: true,
            showDifficulty: true,
            showDate: true,
            truncateTitle: 50,
            truncateContent: 100
        });
        return {
            _id: item._id,
            gimmickCardHtml: cardHtml // リピーター内のHTMLコンポーネントにバインドするプロパティ名
        };
    });

    repeater.onItemReady(($item, itemData) => {
        // HTMLコンポーネントに生成されたHTMLを設定
        const htmlComponent = $item("#gimmickCardHtml"); // リピーター内のHTMLコンポーネントのID
        if (htmlComponent) {
            htmlComponent.html = itemData.gimmickCardHtml;
        }

        // カード全体へのクリックイベント設定
        const cardContainer = $item("#gimmickCardContainer"); // リピーター内のカード全体のコンテナID
        if (cardContainer) {
            cardContainer.onClick(() => {
                wixLocation.to(`/gimmick-info/${itemData._id}`);
            });
        }
    });
    repeater.expand();
}

function showErrorMessage(message) {
    const noResultsMsg = $w("#noResultsMessage");
    const repeater = $w("#gimmickRepeater");
    const pagination = $w("#paginationContainer");

    if (repeater) repeater.collapse();
    if (pagination) pagination.collapse();
    if (noResultsMsg) {
        noResultsMsg.text = message;
        noResultsMsg.expand();
    }
}

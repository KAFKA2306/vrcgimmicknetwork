import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { GimmickService } from 'backend/gimmick-service';
import { highlight } from 'public/scripts/code-utils'; // Assuming this exists
import { renderGimmickCard } from 'public/scripts/ui-components'; // Assuming this exists

$w.onReady(function () {
    // Set page title
    $w("#pageTitle").text = "VRCギミック技術情報プラットフォーム";

    // Load and display latest gimmicks
    loadLatestGimmicks();

    // Initialize category filter
    initializeCategoryFilter();

    // Initialize search function
    initializeSearchFunction();
});

// Load and display the latest gimmicks
async function loadLatestGimmicks() {
    try {
        const results = await GimmickService.getGimmicks({ limit: 10 });
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = "表示できるギミック情報がありません。";
        }
    } catch (error) {
        console.error("Error loading gimmicks:", error);
        showErrorMessage("データの読み込みに失敗しました。");
    }
}

// Initialize category filter
function initializeCategoryFilter() {
    // Load categories and populate the dropdown
    loadCategories();

    // Handle category selection
    $w("#categoryDropdown").onChange(() => {
        const selectedCategory = $w("#categoryDropdown").value;
        if (!selectedCategory || selectedCategory === "all") {
            loadLatestGimmicks();
        } else {
            filterByCategory(selectedCategory);
        }
    });
}

// Load categories and populate the dropdown
async function loadCategories() {
    try {
        const categories = await GimmickService.getCategories();
        const options = [{ label: "すべてのカテゴリ", value: "all" }];
        categories.forEach(category => {
            options.push({ label: category, value: category });
        });
        $w("#categoryDropdown").options = options;
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Filter gimmicks by category
async function filterByCategory(category) {
    try {
        const results = await GimmickService.searchGimmicks(null, { category: category, limit: 10 });
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = `「${category}」に該当するギミック情報はありません。`;
        }
    } catch (error) {
        console.error(`Error filtering by category "${category}":`, error);
        showErrorMessage("フィルタリング中にエラーが発生しました。");
    }
}

// Initialize search function
function initializeSearchFunction() {
    // Handle search button click
    $w("#searchButton").onClick(() => {
        const keyword = $w("#searchInput").value;
        if (keyword && keyword.trim() !== "") {
            searchGimmicks(keyword.trim());
        } else {
            loadLatestGimmicks();
        }
    });

    // Handle Enter key press in the search input
    $w("#searchInput").onKeyPress((event) => {
        if (event.key === "Enter") {
            const keyword = $w("#searchInput").value;
            if (keyword && keyword.trim() !== "") {
                searchGimmicks(keyword.trim());
            }
        }
    });
}

// Search for gimmicks
async function searchGimmicks(keyword) {
    try {
        const results = await GimmickService.searchGimmicks(keyword, { limit: 10 });
        if (results.items.length > 0) {
            displayGimmickItems(results.items);
            $w("#noResultsMessage").collapse();
        } else {
            $w("#gimmickRepeater").collapse();
            $w("#noResultsMessage").expand();
            $w("#noResultsMessage").text = `「${keyword}」に一致する情報は見つかりませんでした。`;
        }
    } catch (error) {
        console.error(`Error searching for "${keyword}":`, error);
        showErrorMessage("検索中にエラーが発生しました。");
    }
}

// Display gimmick items in the repeater
function displayGimmickItems(items) {
    const repeater = $w("#gimmickRepeater");
    repeater.data = items;
    repeater.expand();

    repeater.onItemReady(($item, itemData) => {
        renderGimmickCard($item, itemData); // Assuming this function exists in ui-components.js
    });
}

// Show error message
function showErrorMessage(message) {
    $w("#gimmickRepeater").collapse();
    $w("#noResultsMessage").text = message;
    $w("#noResultsMessage").expand();
}
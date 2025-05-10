import wixData from 'wix-data';

$w.onReady(function () {
    // ページ読み込み時の初期処理
    loadLatestGimmicks(); // 最新ギミック情報を読み込む関数を呼び出す

    // カテゴリフィルターのドロップダウン要素のIDを確認・設定してください
    // 例: $w("#categoryDropdown")
    // もしIDが異なる場合は、実際のIDに置き換えてください。
    const categoryDropdown = $w("#categoryDropdown"); // ★Wixエディタで配置したカテゴリ選択用ドロップダウンのID

    if (categoryDropdown && typeof categoryDropdown.onChange === 'function') {
        categoryDropdown.onChange(() => {
            const selectedCategory = categoryDropdown.value;
            filterGimmicksByCategory(selectedCategory);
        });
    } else if (categoryDropdown) {
        console.warn("要素 #categoryDropdown に onChange イベントハンドラを設定できませんでした。要素タイプを確認してください。");
    } else {
        console.warn("要素 #categoryDropdown がページに見つかりません。");
    }
});

// 最新のギミック情報を取得して表示する関数
async function loadLatestGimmicks() {
    try {
        const results = await wixData.query("GimmickInfo") // コレクション名を確認
            .descending("_createdDate") // 作成日の降順で並び替え
            .limit(10) // 表示件数を10件に制限 (仕様書5.2.1)
            .find();

        // ギミック情報を表示するリピーターのIDを確認・設定してください
        // 例: $w("#gimmickRepeater")
        const gimmickRepeater = $w("#gimmickRepeater"); // ★Wixエディタで配置した情報一覧表示用リピーターのID

        if (results.items.length > 0) {
            if (gimmickRepeater) {
                gimmickRepeater.data = results.items; // リピーターにデータをセット
                gimmickRepeater.expand(); // リピーターを表示（非表示の場合）
                console.log("新着ギミック情報をリピーターにセットしました:", results.items);
            } else {
                console.warn("要素 #gimmickRepeater がページに見つかりません。");
            }
        } else {
            if (gimmickRepeater) {
                gimmickRepeater.data = []; // データがない場合は空にする
                gimmickRepeater.collapse(); // リピーターを非表示にするか、別途「情報がありません」表示を制御
                console.log("新着ギミック情報はありません。");
            }
        }
    } catch (error) {
        console.error("ギミック情報の読み込みに失敗しました:", error);
        const gimmickRepeater = $w("#gimmickRepeater");
        if (gimmickRepeater) {
            gimmickRepeater.data = [];
            // エラーメッセージをユーザーに表示する処理を追加することも検討
        }
    }
}

// カテゴリでギミック情報をフィルタリングする関数
async function filterGimmicksByCategory(category) {
    const gimmickRepeater = $w("#gimmickRepeater"); // ★Wixエディタで配置した情報一覧表示用リピーターのID

    if (!gimmickRepeater) {
        console.warn("要素 #gimmickRepeater がページに見つかりません。フィルタリング処理をスキップします。");
        return;
    }

    try {
        if (!category || category === "ALL_CATEGORIES_PLACEHOLDER") { // "すべて表示" のような値の場合
            await loadLatestGimmicks(); // 全ての最新ギミックを再読み込み
            return;
        }

        let query = wixData.query("GimmickInfo") // コレクション名を確認
            .eq("gimmickCategory", category) // gimmickCategoryフィールドが選択されたカテゴリと一致するものを検索
            .descending("_createdDate")
            .limit(10); // 必要に応じて表示件数を調整

        // Add search functionality here
        const searchTerm = $w("#searchInput").value; // Assuming you have a search input with ID "searchInput"
        if (searchTerm) {
            query = query.contains("title", searchTerm) // Search in the title field
                       .or(query.contains("body", searchTerm)); // Search in the body field
        }

        const results = await query.find();

        if (results.items.length > 0) {
            gimmickRepeater.data = results.items;
            gimmickRepeater.expand();
            console.log(`カテゴリ "${category}" でフィルタリングされたギミック情報:`, results.items);
        } else {
            gimmickRepeater.data = [];
            // 「該当する情報がありません」というメッセージを表示するUI要素を制御
            console.log(`カテゴリ "${category}" に該当するギミック情報はありません。`);
        }
    } catch (error) {
        console.error(`カテゴリ "${category}" でのフィルタリング中にエラーが発生しました:`, error);
        gimmickRepeater.data = [];
    }
}

import wixData from 'wix-data';
import { GimmickService } from 'backend/gimmick-service';
import { highlight } from 'public/scripts/code-utils';

$w.onReady(async function () {
    // 現在表示されているギミック情報を取得
    const item = await $w("#dynamicDataset").getCurrentItem();
    if (!item) {
        showErrorMessage("ギミック情報の読み込みに失敗しました。");
        return;
    }
    
    // ページタイトルを設定
    $w("#pageTitle").text = item.title;
    
    // 技術仕様カードの表示
    renderTechSpecs(item);
    
    // コードスニペットのハイライト処理
    highlightCodeSnippets();
    
    // 関連ギミック情報の表示
    loadRelatedGimmicks(item._id, item.gimmickCategory);
    
    // 各種UI要素の調整
    setupUIComponents(item);
});

// 技術仕様カードの表示
function renderTechSpecs(item) {
    let techSpecsHtml = `<div class="tech-specs-card">`;
    
    // Unityバージョン
    if (item.unityVersion) {
        techSpecsHtml += `<div class="spec-item">
            <span class="spec-label">Unityバージョン:</span>
            <span class="spec-value">${item.unityVersion}</span>
        </div>`;
    }
    
    // SDKバージョン
    if (item.sdkVersion) {
        techSpecsHtml += `<div class="spec-item">
            <span class="spec-label">SDKバージョン:</span>
            <span class="spec-value">${item.sdkVersion}</span>
        </div>`;
    }
    
    // 対象
    if (item.target) {
        const targetText = Array.isArray(item.target) ? item.target.join(', ') : item.target;
        techSpecsHtml += `<div class="spec-item">
            <span class="spec-label">対象:</span>
            <span class="spec-value">${targetText}</span>
        </div>`;
    }
    
    // 難易度
    if (item.difficulty) {
        let difficultyColor = "";
        switch(item.difficulty) {
            case "初心者向け": difficultyColor = "green"; break;
            case "中級者向け": difficultyColor = "orange"; break;
            case "上級者向け": difficultyColor = "red"; break;
        }
        
        techSpecsHtml += `<div class="spec-item">
            <span class="spec-label">難易度:</span>
            <span class="spec-value difficulty-${difficultyColor}">${item.difficulty}</span>
        </div>`;
    }
    
    // 前提知識・依存アセット
    if (item.prerequisites) {
        techSpecsHtml += `<div class="spec-item full-width">
            <span class="spec-label">前提知識・依存アセット:</span>
            <div class="spec-value">${item.prerequisites}</div>
        </div>`;
    }
    
    // 動作確認環境
    if (item.environment) {
        techSpecsHtml += `<div class="spec-item full-width">
            <span class="spec-label">動作確認環境:</span>
            <div class="spec-value">${item.environment}</div>
        </div>`;
    }
    
    techSpecsHtml += `</div>`;
    
    // HTMLを設定
    $w("#techSpecsContainer").html = techSpecsHtml;
}

// コードスニペットのハイライト処理
function highlightCodeSnippets() {
    // コンテンツ内のpreタグを探して処理
    const content = $w("#contentContainer").html;
    if (!content) return;
    
    // ハイライト処理後のHTMLを生成
    const highlightedContent = highlight(content);
    
    // 更新したコンテンツを設定
    $w("#contentContainer").html = highlightedContent;
}

// 関連ギミック情報の読み込みと表示
async function loadRelatedGimmicks(currentId, category) {
    try {
        const related = await GimmickService.getRelatedGimmicks(currentId, category, 5);
        
        if (related.items.length > 0) {
            $w("#relatedGimmicksRepeater").data = related.items;
            $w("#relatedGimmicksSection").expand();
            
            // リピーター内の各アイテムをカスタマイズ
            $w("#relatedGimmicksRepeater").onItemReady(($item, itemData) => {
                $item("#relatedTitle").text = itemData.title;
                
                if (itemData.mainImage) {
                    $item("#relatedImage").src = itemData.mainImage;
                } else {
                    $item("#relatedImage").src = "/images/default-gimmick.webp";
                }
                
                $item("#relatedLink").onClick(() => {
                    wixLocation.to(`/gimmick-info/${itemData._id}`);
                });
            });
        } else {
            $w("#relatedGimmicksSection").collapse();
        }
    } catch (error) {
        console.error("関連ギミック情報の読み込みに失敗しました:", error);
        $w("#relatedGimmicksSection").collapse();
    }
}

// UI要素の設定
function setupUIComponents(item) {
    // 投稿日・更新日の表示
    if (item._createdDate) {
        const createdDate = new Date(item._createdDate);
        $w("#createdDate").text = `投稿日: ${createdDate.getFullYear()}年${createdDate.getMonth() + 1}月${createdDate.getDate()}日`;
    }
    
    if (item._updatedDate) {
        const updatedDate = new Date(item._updatedDate);
        $w("#updatedDate").text = `更新日: ${updatedDate.getFullYear()}年${updatedDate.getMonth() + 1}月${updatedDate.getDate()}日`;
    }
    
    // 制作者名の表示
    if (item.authorName) {
        $w("#authorName").text = `制作者: ${item.authorName}`;
        $w("#authorName").expand();
    } else {
        $w("#authorName").collapse();
    }
    
    // カテゴリとタグの表示
    if (item.gimmickCategory) {
        const categoryText = Array.isArray(item.gimmickCategory) 
            ? item.gimmickCategory.join(", ") 
            : item.gimmickCategory;
        $w("#categoryDisplay").text = categoryText;
    }
    
    if (item.gimmickTag) {
        const tagText = Array.isArray(item.gimmickTag) 
            ? item.gimmickTag.join(", ") 
            : item.gimmickTag;
        $w("#tagDisplay").text = tagText;
    }
}

// エラーメッセージ表示
function showErrorMessage(message) {
    $w("#errorMessage").text = message;
    $w("#errorMessage").expand();
    $w("#contentContainer").collapse();
}
s
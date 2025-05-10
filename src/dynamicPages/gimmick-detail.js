import { GimmickService } from 'backend/gimmick-service';
import { CodeHighlighter } from 'public/scripts/code-utils';
import { renderRelatedItems } from 'public/scripts/ui-components';

$w.onReady(async () => {
    const item = await $w("#dynamicDataset").getCurrentItem();
    
    // 技術仕様カードの生成
    $w("#techSpecs").html = `
        
            動作環境詳細
            
                Unityバージョン
                ${item.unityVersion}
                SDKバージョン
                ${item.sdkVersion}
                対応プラットフォーム
                ${item.target.join(', ')}
            
        
    `;

    // コードハイライト処理
    CodeHighlighter.applyToContent(item.content);
    
    // 関連記事取得
    const related = await GimmickService.getRelatedGimmicks(item._id, item.gimmickCategory);
    renderRelatedItems(related.items, '#relatedItems');
});
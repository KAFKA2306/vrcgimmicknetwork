import { GimmickService } from 'backend/gimmick-service';
import { render3DCarousel } from 'public/scripts/webgl-carousel';
import { renderGimmickList } from 'public/scripts/ui-components';

$w.onReady(async () => {
    // WebGLベースの3Dカルーセル初期化
    const carousel = new WebGLCarousel('webglCanvas');
    
    // 最新の初心者向け記事を取得
    const results = await GimmickService.searchGimmicks("", {
        difficulty: "初心者向け"
    });
    
    // 3Dカルーセルにデータをバインド
    $w("#heroSection").html = await render3DCarousel(results.items);
    
    // リスト表示
    $w("#latestList").data = results.items;
});

// リアルタイム検索機能
$w("#searchInput").onKeyPress(async (event) => {
    if (event.key === "Enter") {
        const results = await GimmickService.searchGimmicks(event.target.value);
        renderGimmickList(results.items, '#searchResults');
    }
});

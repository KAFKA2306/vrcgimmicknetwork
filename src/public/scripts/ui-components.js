import wixWindow from 'wix-window';

// ギミックカード表示機能
export function renderGimmickCard(item, options = {}) {
    const {
        showImage = true,
        showCategory = true,
        showDifficulty = true,
        showDate = true,
        truncateTitle = 60,
        truncateContent = 120
    } = options;
    
    let html = `<div class="gimmick-card">`;
    
    // アイキャッチ画像
    if (showImage) {
        const imageUrl = item.mainImage || '/images/default-gimmick.webp';
        html += `<div class="card-image">
            <img src="${imageUrl}" alt="${item.title}" loading="lazy">
        </div>`;
    }
    
    // カード本文
    html += `<div class="card-body">`;
    
    // タイトル
    const title = truncateTitle > 0 && item.title.length > truncateTitle
        ? item.title.substring(0, truncateTitle) + '...'
        : item.title;
    html += `<h3 class="card-title">${title}</h3>`;
    
    // メタ情報
    html += `<div class="card-meta">`;
    
    // 難易度
    if (showDifficulty && item.difficulty) {
        let difficultyClass = '';
        switch (item.difficulty) {
            case '初心者向け': difficultyClass = 'beginner'; break;
            case '中級者向け': difficultyClass = 'intermediate'; break;
            case '上級者向け': difficultyClass = 'advanced'; break;
        }
        
        html += `<span class="difficulty-badge ${difficultyClass}">${item.difficulty}</span>`;
    }
    
    // カテゴリ
    if (showCategory && item.gimmickCategory) {
        const categoryText = Array.isArray(item.gimmickCategory)
            ? item.gimmickCategory[0]
            : item.gimmickCategory;
        
        html += `<span class="category-badge">${categoryText}</span>`;
    }
    
    // 日付
    if (showDate && item._createdDate) {
        const date = new Date(item._createdDate);
        const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        
        html += `<span class="date-badge">${dateStr}</span>`;
    }
    
    html += `</div>`; // End of card-meta
    
    // 概要
    if (item.content) {
        // HTMLタグを除去
        const plainText = item.content.replace(/<[^>]*>/g, '');
        const excerpt = truncateContent > 0 && plainText.length > truncateContent
            ? plainText.substring(0, truncateContent) + '...'
            : plainText;
        
        html += `<p class="card-excerpt">${excerpt}</p>`;
    }
    
    html += `</div>`; // End of card-body
    html += `</div>`; // End of gimmick-card
    
    return html;
}

// ページネーション表示
export function renderPagination(currentPage, totalPages, baseUrl) {
    if (totalPages <= 1) return '';
    
    let html = `<div class="pagination">`;
    
    // 前へ
    if (currentPage > 1) {
        html += `<a href="${baseUrl}?page=${currentPage - 1}" class="pagination-prev">前へ</a>`;
    } else {
        html += `<span class="pagination-prev disabled">前へ</span>`;
    }
    
    // ページ番号
    const maxPages = 5; // 表示する最大ページ数
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // 調整
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // 最初のページ
    if (startPage > 1) {
        html += `<a href="${baseUrl}?page=1" class="pagination-link">1</a>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // ページ番号
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-link current">${i}</span>`;
        } else {
            html += `<a href="${baseUrl}?page=${i}" class="pagination-link">${i}</a>`;
        }
    }
    
    // 最後のページ
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<a href="${baseUrl}?page=${totalPages}" class="pagination-link">${totalPages}</a>`;
    }
    
    // 次へ
    if (currentPage < totalPages) {
        html += `<a href="${baseUrl}?page=${currentPage + 1}" class="pagination-next">次へ</a>`;
    } else {
        html += `<span class="pagination-next disabled">次へ</span>`;
    }
    
    html += `</div>`;
    
    return html;
}

// トップに戻るボタン
export function setupBackToTopButton() {
    // スクロール検知
    wixWindow.onScroll((event) => {
        const scrollTop = event.y;
        const backToTopButton = document.querySelector('.back-to-top');
        
        if (!backToTopButton) return;
        
        // 200px以上スクロールしたらボタンを表示
        if (scrollTop > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // クリックイベント
    document.querySelector('.back-to-top')?.addEventListener('click', () => {
        wixWindow.scrollTo(0, 0);
    });
}

// ハイライトライブラリ（highlight.js等）をインポート
import hljs from 'highlight.js';

// コードスニペットハイライト機能
export function highlight(htmlContent) {
    // DOMパーサーを使用してHTML解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // pre > code要素を検索
    const codeBlocks = doc.querySelectorAll('pre code');
    
    // 各コードブロックを処理
    codeBlocks.forEach(block => {
        // 言語クラスを確認
        const language = block.className.replace('language-', '');
        
        try {
            // ハイライト処理
            if (language && hljs.getLanguage(language)) {
                // 特定言語でハイライト
                const result = hljs.highlight(block.textContent, { language });
                block.innerHTML = result.value;
            } else {
                // 自動言語検出
                const result = hljs.highlightAuto(block.textContent);
                block.innerHTML = result.value;
            }
            
            // 行番号追加
            block.innerHTML = addLineNumbers(block.innerHTML);
            
            // コピーボタン追加
            const pre = block.parentElement;
            addCopyButton(pre);
            
        } catch (error) {
            console.error('コードハイライト処理中にエラーが発生しました:', error);
        }
    });
    
    // 処理後のHTMLを返却
    return doc.body.innerHTML;
}

// 行番号追加処理
function addLineNumbers(html) {
    const lines = html.split('\n');
    let numberedHtml = '';
    
    lines.forEach((line, index) => {
        // 空行の場合は特別処理
        if (line.trim() === '') {
            numberedHtml += `<span class="line-number">${index + 1}</span><br>`;
        } else {
            numberedHtml += `<span class="line-number">${index + 1}</span>${line}${index < lines.length - 1 ? '\n' : ''}`;
        }
    });
    
    return numberedHtml;
}

// コピーボタン追加処理
function addCopyButton(preElement) {
    // 既存のボタンを削除（重複防止）
    const existingButton = preElement.querySelector('.copy-button');
    if (existingButton) {
        existingButton.remove();
    }
    
    // コピーボタン作成
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'コピー';
    
    // ボタンクリックイベント
    button.addEventListener('click', () => {
        // コードブロックのテキストを取得（行番号を除去）
        const codeText = preElement.querySelector('code').textContent;
        
        // クリップボードにコピー
        navigator.clipboard.writeText(codeText)
            .then(() => {
                // コピー成功時の表示
                button.textContent = 'コピー完了！';
                setTimeout(() => {
                    button.textContent = 'コピー';
                }, 2000);
            })
            .catch(err => {
                // コピー失敗時の表示
                console.error('コピーに失敗しました:', err);
                button.textContent = 'コピー失敗';
                setTimeout(() => {
                    button.textContent = 'コピー';
                }, 2000);
            });
    });
    
    // ボタンをpre要素に追加
    preElement.appendChild(button);
}

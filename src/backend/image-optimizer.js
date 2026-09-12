import wixMedia from 'wix-media-backend';

// 画像最適化機能を提供するモジュール
export async function optimizeImage(imageUrl, options = {}) {
    // 既にWix Media形式URLの場合
    if (imageUrl.includes('media.wix.com')) {
        return addOptimizationParams(imageUrl, options);
    }

    // 外部URL等の画像をアップロード。失敗は呼び出し元へ伝播させる。
    const uploadedImage = await uploadImage(imageUrl);
    return addOptimizationParams(uploadedImage, options);
}

// Wixメディアに画像をアップロード
async function uploadImage(imageUrl) {
    // 画像のフェッチ
    const response = await fetch(imageUrl);
    if (response.ok === false) {
        throw new Error(`Image fetch failed with status ${response.status}.`);
    }
    const blob = await response.blob();

    // Wixメディアにアップロード
    const uploadedFile = await wixMedia.upload(
        'images',
        blob,
        getFilenameFromUrl(imageUrl)
    );

    if (!uploadedFile || typeof uploadedFile.fileUrl !== 'string' || uploadedFile.fileUrl.trim() === '') {
        throw new Error('Wix media upload did not return a file URL.');
    }

    return uploadedFile.fileUrl;
}

// URLからファイル名を抽出
function getFilenameFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

        // ファイル名がない場合はデフォルト名
        return filename || `image-${Date.now()}.jpg`;
    } catch (error) {
        return `image-${Date.now()}.jpg`;
    }
}

// Wixメディア画像URLに最適化パラメータを追加
function addOptimizationParams(imageUrl, options) {
    const { format = 'webp', quality = 80, resize = null } = options;
    const params = [];

    // フォーマット
    if (format) {
        params.push(`f=${format}`);
    }

    // 品質
    if (quality && quality > 0 && quality <= 100) {
        params.push(`q=${quality}`);
    }

    // リサイズ
    if (resize) {
        if (resize.width && resize.height) {
            params.push(`w=${resize.width}`);
            params.push(`h=${resize.height}`);
        } else if (resize.width) {
            params.push(`w=${resize.width}`);
        } else if (resize.height) {
            params.push(`h=${resize.height}`);
        }
    }

    // URLにパラメータを追加
    if (params.length > 0) {
        return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}${params.join('&')}`;
    }

    return imageUrl;
}

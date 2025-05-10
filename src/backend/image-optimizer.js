import wixMedia from 'wix-media-backend';

// 画像最適化機能を提供するモジュール
export async function optimizeImage(imageUrl, options = {}) {
    try {
        // 既にWix Media形式URLの場合
        if (imageUrl.includes('media.wix.com')) {
            return addOptimizationParams(imageUrl, options);
        }
        
        // 外部URL等の画像をアップロード
        const uploadedImage = await uploadImage(imageUrl);
        return addOptimizationParams(uploadedImage, options);
    } catch (error) {
        console.error("画像最適化中にエラーが発生しました:", error);
        return imageUrl; // エラー時は元の画像URLを返す
    }
}

// Wixメディアに画像をアップロード
async function uploadImage(imageUrl) {
    try {
        // 画像のフェッチ
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Wixメディアにアップロード
        const uploadedFile = await wixMedia.upload(
            'images',
            blob,
            getFilenameFromUrl(imageUrl)
        );
        
        return uploadedFile.fileUrl;
    } catch (error) {
        console.error("画像アップロード中にエラーが発生しました:", error);
        throw error;
    }
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
    
    try {
        // パラメータ構築
        let params = [];
        
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
            // 既にクエリパラメータがあるか確認
            if (imageUrl.includes('?')) {
                return `${imageUrl}&${params.join('&')}`;
            } else {
                return `${imageUrl}?${params.join('&')}`;
            }
        }
        
        return imageUrl;
    } catch (error) {
        console.error("画像URL最適化中にエラーが発生しました:", error);
        return imageUrl;
    }
}

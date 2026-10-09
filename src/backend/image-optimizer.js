import wixMedia from 'wix-media-backend';

export async function optimizeImage(imageUrl, options = {}) {
    const preparedUrl = imageUrl.includes('media.wix.com')
        ? imageUrl
        : await uploadImage(imageUrl);

    if (!preparedUrl || !preparedUrl.includes('media.wix.com')) {
        throw new Error('Image preparation did not produce a Wix media URL');
    }

    return addOptimizationParams(preparedUrl, options);
}

async function uploadImage(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Image fetch failed with HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const uploadedFile = await wixMedia.upload('images', blob, getFilenameFromUrl(imageUrl));
    if (!uploadedFile?.fileUrl) {
        throw new Error('Wix media upload returned no file URL');
    }
    return uploadedFile.fileUrl;
}

function getFilenameFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1) || 'image.jpg';
    } catch {
        return 'image.jpg';
    }
}

function addOptimizationParams(imageUrl, options) {
    const { format = 'webp', quality = 80, resize = null } = options;
    const params = [];

    if (format) params.push(`f=${format}`);
    if (quality && quality > 0 && quality <= 100) params.push(`q=${quality}`);
    if (resize?.width) params.push(`w=${resize.width}`);
    if (resize?.height) params.push(`h=${resize.height}`);

    if (params.length === 0) return imageUrl;
    return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}${params.join('&')}`;
}

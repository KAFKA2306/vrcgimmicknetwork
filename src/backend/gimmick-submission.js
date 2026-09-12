export const MAIN_IMAGE_OPTIONS = Object.freeze({
    format: 'webp',
    quality: 80,
    resize: Object.freeze({ width: 1200, height: 900 })
});

export async function createGimmickSubmission(data, dependencies) {
    const { validateGimmick, optimizeImage, insert } = dependencies;
    const validation = validateGimmick(data);

    if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
    }

    const record = { ...data };

    if (record.mainImage) {
        const preparedImage = await optimizeImage(record.mainImage, MAIN_IMAGE_OPTIONS);
        if (typeof preparedImage !== 'string' || preparedImage.trim() === '') {
            throw new Error('Main image preparation did not produce a media URL.');
        }
        record.mainImage = preparedImage;
    }

    return insert('GimmickInfo', record);
}

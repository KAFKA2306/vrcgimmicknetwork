export async function createPreparedGimmick(data, { validate, prepareImage, insert }) {
    const validation = validate(data);
    if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
    }

    const prepared = { ...data };
    if (prepared.mainImage) {
        prepared.mainImage = await prepareImage(prepared.mainImage, {
            format: 'webp',
            quality: 80,
            resize: { width: 1200, height: 900 }
        });
    }
    return insert(prepared);
}

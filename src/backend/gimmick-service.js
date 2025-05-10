import wixData from 'wix-data';
import { ContentValidator } from './content-validator';
import { optimizeImage } from './image-optimizer';

export const GimmickService = {
    createGimmick: async (data) => {
        const validation = ContentValidator.validateGimmick(data);
        if (!validation.valid) throw new Error(validation.errors.join(', '));
        
        // 画像最適化処理
        if (data.mainImage) {
            data.mainImage = await optimizeImage(data.mainImage, {
                format: 'webp',
                quality: 80,
                resize: { width: 1920 }
            });
        }
        
        return wixData.insert("GimmickInfo", data);
    },

    searchGimmicks: async (query, filters = {}) => {
        let builder = wixData.query("GimmickInfo")
            .contains("title", query)
            .or(wixData.query("GimmickInfo").contains("content", query));

        Object.entries(filters).forEach(([key, value]) => {
            if (value) builder = builder.eq(key, value);
        });

        return builder.descending("_createdDate").find();
    },

    getRelatedGimmicks: async (currentId, category) => {
        return wixData.query("GimmickInfo")
            .ne("_id", currentId)
            .hasSome("gimmickCategory", [category])
            .limit(5)
            .find();
    }
};

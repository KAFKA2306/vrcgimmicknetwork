import wixData from 'wix-data';
import { ContentValidator } from './content-validator';
import { optimizeImage } from './image-optimizer';

// GimmickService: ギミック情報に関する操作を提供するサービス
export const GimmickService = {
    // 新規ギミック情報作成
    createGimmick: async (data) => {
        // バリデーション
        const validation = ContentValidator.validateGimmick(data);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }
        
        // 画像最適化
        if (data.mainImage) {
            data.mainImage = await optimizeImage(data.mainImage, {
                format: 'webp',
                quality: 80,
                resize: { width: 1200, height: 900 }
            });
        }
        
        // データ挿入
        return wixData.insert("GimmickInfo", data);
    },
    
    // ギミック情報取得
    getGimmick: async (id) => {
        return wixData.get("GimmickInfo", id);
    },
    
    // ギミック情報一覧取得
    getGimmicks: async (options = {}) => {
        const { limit = 10, skip = 0, sort = "_createdDate", order = "desc" } = options;
        
        let query = wixData.query("GimmickInfo");
        
        // ソート順設定
        if (order === "desc") {
            query = query.descending(sort);
        } else {
            query = query.ascending(sort);
        }
        
        // ページネーション
        return query.limit(limit).skip(skip).find();
    },
    
    // ギミック情報検索
    searchGimmicks: async (keyword, options = {}) => {
        const { limit = 10, skip = 0, category = null } = options;
        
        let query = wixData.query("GimmickInfo");
        
        // キーワード検索
        if (keyword) {
            query = query.contains("title", keyword)
                     .or(wixData.query("GimmickInfo").contains("content", keyword));
        }
        
        // カテゴリフィルタ
        if (category) {
            query = query.hasSome("gimmickCategory", [category]);
        }
        
        // 結果取得
        return query.descending("_createdDate").limit(limit).skip(skip).find();
    },
    
    // カテゴリ一覧取得
    getCategories: async () => {
        const results = await wixData.query("GimmickInfo")
            .limit(1000)
            .find();
            
        // ユニークなカテゴリ抽出
        const categories = new Set();
        
        results.items.forEach(item => {
            if (item.gimmickCategory) {
                if (Array.isArray(item.gimmickCategory)) {
                    item.gimmickCategory.forEach(cat => categories.add(cat));
                } else {
                    categories.add(item.gimmickCategory);
                }
            }
        });
        
        return Array.from(categories);
    },
    
    // タグ一覧取得
    getTags: async () => {
        const results = await wixData.query("GimmickInfo")
            .limit(1000)
            .find();
            
        // ユニークなタグ抽出
        const tags = new Set();
        
        results.items.forEach(item => {
            if (item.gimmickTag) {
                if (Array.isArray(item.gimmickTag)) {
                    item.gimmickTag.forEach(tag => tags.add(tag));
                } else {
                    tags.add(item.gimmickTag);
                }
            }
        });
        
        return Array.from(tags);
    },
    
    // 関連ギミック情報取得
    getRelatedGimmicks: async (currentId, category, limit = 5) => {
        return wixData.query("GimmickInfo")
            .ne("_id", currentId)
            .hasSome("gimmickCategory", Array.isArray(category) ? category : [category])
            .limit(limit)
            .find();
    }
};

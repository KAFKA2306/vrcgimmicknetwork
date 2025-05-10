// ギミック情報のバリデーションルール
const gimmickRules = {
    title: { 
        required: true, 
        maxLength: 120,
        message: "タイトルは必須で、120文字以内である必要があります"
    },
    content: { 
        required: true,
        message: "本文は必須です"
    },
    unityVersion: { 
        pattern: /^\d{4}\.\d+\.\d+[a-zA-Z]?\d*$/,
        message: "Unityバージョンの形式が正しくありません（例: 2019.4.31f1）"
    },
    sdkVersion: {
        pattern: /^VRCSDK\d+-[A-Z]+-\d{4}\.\d+\.\d+$/,
        message: "SDKバージョンの形式が正しくありません（例: VRCSDK3-AVATAR-2023.XX.XX）"
    },
    difficulty: { 
        enum: ["初心者向け", "中級者向け", "上級者向け"],
        message: "難易度は「初心者向け」「中級者向け」「上級者向け」のいずれかを選択してください"
    }
};

// コンテンツバリデーション機能を提供するモジュール
export const ContentValidator = {
    // ギミック情報のバリデーション
    validateGimmick: (data) => {
        const errors = [];
        
        // 各フィールドに対するバリデーション
        Object.entries(gimmickRules).forEach(([field, rule]) => {
            const value = data[field];
            
            // 必須チェック
            if (rule.required && (!value || value.trim() === "")) {
                errors.push(rule.message || `${field}は必須です`);
                return;
            }
            
            // 値が存在する場合のみ以下のバリデーションを行う
            if (value) {
                // 最大長チェック
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(rule.message || `${field}は${rule.maxLength}文字以内である必要があります`);
                }
                
                // パターンチェック
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(rule.message || `${field}の形式が正しくありません`);
                }
                
                // 列挙値チェック
                if (rule.enum && !rule.enum.includes(value)) {
                    errors.push(rule.message || `${field}は${rule.enum.join(', ')}のいずれかである必要があります`);
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

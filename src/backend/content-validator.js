const validationRules = {
    title: { type: 'string', maxLength: 120 },
    unityVersion: { 
        pattern: /^\d{4}\.\d+\.\d+[a-zA-Z]?\d*$/,
        allowed: ['2019.4.31f1', '2022.3.6f1']
    },
    difficulty: { 
        enum: ['初心者向け', '中級者向け', '上級者向け'] 
    }
};

export const ContentValidator = {
    validateGimmick: (data) => {
        const errors = [];
        
        Object.entries(validationRules).forEach(([field, rule]) => {
            const value = data[field];
            
            if (rule.required && !value) {
                errors.push(`${field}は必須項目です`);
            }
            
            if (rule.enum && !rule.enum.includes(value)) {
                errors.push(`${field}が不正な値です`);
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field}の形式が不正です`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
};
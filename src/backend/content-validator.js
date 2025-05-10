// ContentValidator: ギミック情報のバリデーションを行うクラス
export const ContentValidator = {
    // ギミック情報のバリデーション
    validateGimmick: (data) => {
        const errors = [];

        if (!data.title || data.title.trim() === "") {
            errors.push("タイトルは必須です。");
        }

        if (!data.content || data.content.trim() === "") {
            errors.push("本文は必須です。");
        }

        // Add more validation rules as needed, e.g., for image format, URL, etc.

        return {
            valid: errors.length === 0,
            errors: errors,
        };
    },
};

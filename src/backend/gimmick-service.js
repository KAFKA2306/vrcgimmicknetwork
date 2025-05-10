import wixData from 'wix-data';

export const GimmickService = {
    search: async (query, filters = {}) => {
        let builder = wixData.query("GimmickInfo")
            .contains("title", query)
            .or(wixData.query("GimmickInfo").contains("content", query));

        Object.entries(filters).forEach(([key, value]) => {
            if (value) builder = builder.eq(key, value);
        });

        return builder.descending("_createdDate").find();
    }
};
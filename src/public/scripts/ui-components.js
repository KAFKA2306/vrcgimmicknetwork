export const renderGimmickList = (items, containerId) => {
    const container = document.querySelector(containerId);
    container.innerHTML = items.map(item => `
        
            
            
                ${item.title}
                
                    ${item.difficulty}
                    ${new Date(item._createdDate).toLocaleDateString()}
                
                ${item.content.substring(0, 100)}...
            
        
    `).join('');
};
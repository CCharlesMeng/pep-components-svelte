
/**
 * Mock data for "Whole Network Articles"
 * @param type - The category type (e.g., '10', '200', etc.)
 * @param count - Number of items to return
 * @returns Array of article items
 */
export function getMockArticles(type: string, count: number = 5): Array<{ title: string, url: string }> {
    const types: Record<string, string> = {
        '10': '全部', '200': '专题', '21': '产品', '22': '解决方案', '30': '帮助中心',
        '50': '云市场', '23': '开发者', '61': '博客', '65': '论坛', '63': '视频',
        '24': '云学院', '241': '基础课程', '242': '系列课程', '243': '认证',
        '244': '试验', '25': '知识', '20': '网站', '60': '云社区'
    };
    const typeName = types[type] || '未知分类';

    return Array.from({ length: count }, (_, i) => ({
        title: `[${typeName}] 推荐文章示例 ${i + 1}`,
        url: '#'
    }));
}

/**
 * Mock data for "User Manuals"
 * @param guideType - '1' (Doc), '2' (Keyword), '3' (Label)
 * @param count - Number of items to return
 * @returns Array of manual items
 */
export function getMockManuals(guideType: string, count: number = 5): Array<{ title: string, url: string }> {
    const guideTypes: Record<string, string> = {
        '1': '文档', '2': '聚合关键词', '3': '标签'
    };
    const typeName = guideTypes[guideType] || '未知类型';

    return Array.from({ length: count }, (_, i) => ({
        title: `[用户手册-${typeName}] 示例条目 ${i + 1}`,
        url: '#'
    }));
}

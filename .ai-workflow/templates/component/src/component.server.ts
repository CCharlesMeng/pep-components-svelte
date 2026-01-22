import type { {{COMPONENT_NAME_PASCAL}}Props } from './types';

/**
 * 服务端数据加载器
 * 
 * @param method - 包含 requestClient 等工具
 * @param data - 基础配置数据（由 Vite 插件或本地文件注入）
 * @returns 经过处理后的组件 Props
 */
export const loader = async (method: { requestClient: any }, data: any): Promise<{{COMPONENT_NAME_PASCAL}}Props> => {
    // 逻辑：直接返回从配置文件读取的数据
    // 在开发环境下，data 会由 shared/core/main.ts 加载并传入
    // 在生产环境下，此 loader 可能会执行更复杂的业务逻辑（如调用 API）
    return {
        ...data
    };
}

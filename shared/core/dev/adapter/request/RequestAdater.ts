export class RequestAdater {
    // 模拟request，解析对应组件的mock/api/index.ts，返回mock数据
    // 提供的是request方法，不要各种方法，直接返回mock数据
    // 可基于mock数据中的mock字段选择是使用mock数据还是实际调用接口
    /**
     * 通用 request 方法，自动读取组件 mocks/api/index.ts，返回匹配的 mock 数据。
     * 若 mock 字段为 false，则使用 axios 实际请求接口。
     * @param options 包含 url/method/params/data 字段，格式与 axios/uni.request 等通用框架兼容
     * @param mockApiPath 组件 mock/api/index.ts 的绝对路径（由上层传入）
     * @returns Promise<any>
     */
    async request(
        options: {
            url: string;
            method?: string;
            params?: any;
            data?: any;
        },
        mockApiPath: string
    ): Promise<any> {
        let mockConfigs: any[] = [];
        try {
            // 动态加载指定路径下的 mock 配置
            mockConfigs = (await import(/* @vite-ignore */ mockApiPath)).default || [];
        } catch (err) {
            // 没有 mock 配置，兜底走实际接口
            return this._requestByAxios(options);
        }

        const { url, method = 'get' } = options;
        // 匹配 mock 配置
        const matched = mockConfigs.find(
            (cfg: any) =>
                cfg.url === url &&
                (cfg.method?.toLowerCase?.() || 'get') === method.toLowerCase()
        );

        // 没有匹配，走实际接口
        if (!matched) {
            return this._requestByAxios(options);
        }

        // mock === false，走真实接口
        if (matched.mock === false) {
            return this._requestByAxios(options);
        }

        // mock === true，返回 mock response
        return matched.response ?? {};
    }

    /**
     * 真实接口请求方法，依赖 axios（需外部已引入）
     */
    private async _requestByAxios(options: {
        url: string;
        method?: string;
        params?: any;
        data?: any;
    }): Promise<any> {
        // 这里假定 axios 已全局可用或外部提前 import
        // 若 axios 无法直接获得，可改为传参、单例等注入
        if (typeof window === 'undefined') {
            // node 环境下 require
            const axios = (await import('axios')).default;
            return axios(options).then((res: any) => res.data);
        } else {
            // 浏览器环境
            // @ts-ignore
            return window.axios
                ? window.axios(options).then((res: any) => res.data)
                : Promise.reject('axios not found');
        }
    }
}
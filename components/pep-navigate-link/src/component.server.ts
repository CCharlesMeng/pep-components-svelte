import type { Config } from './types';

export const loader = async (method: { requestClient: any }, data: any): Promise<Config> => {
    return {
        "baseInfo": {
            "bg": "bluegrey",
            "isShowKeyWord": true,
            "isFixed": true,
            "top": 10,
            "bottom": 0
        },
    }
}
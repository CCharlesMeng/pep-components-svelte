import type { Config } from './types';

export const loader = async (method: { requestClient: any }, data: any): Promise<Config> => {
    return {
        ...data
    };
}

import type { PepDocApiProps } from './types';

export const loader = async (method: { requestClient: any }, data: PepDocApiProps): Promise<PepDocApiProps> => {
    return {
        ...data
    };
};

import type { FloorData } from './types';

export const loader = async (method: { requestClient: any }, data: any): Promise<FloorData> => {
    return {
        ...data
    };
}

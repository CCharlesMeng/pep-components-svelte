import { createDataLoader } from '@pep/bff';
import type { PageServerLoad } from './$types';

// Use the new createDataLoader which supports both BFF (via Header) and dev mode (via data.json)
const loadConfig = createDataLoader('src/lib/data.json');

export const load: PageServerLoad = async (event) => {
    const config = await loadConfig(event);

    return {
        config
    };
};


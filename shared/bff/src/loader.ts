import { promises as fs } from 'fs';
import path from 'path';
import { render } from 'svelte/server';

const COMPONENT_DATA_HEADER = 'x-component-data';

// 运行时动态判断环境，避免被 Vite 静态替换
function isDevMode() {
    return process.env.NODE_ENV === 'development';
}

/**
 * Creates a data loader that reads data from BFF or local JSON file.
 *
 * Data priority:
 * 1. req.componentData (direct object, recommended)
 * 2. x-component-data header (JSON string)
 * 3. Local data.json (only in dev mode)
 *
 * @param jsonPath - Relative path to the JSON file from the project root (e.g., 'data.json').
 * @returns A data loading function.
 */
export function createDataLoader(jsonPath: string = 'data.json') {
    return async ({ request }: { request: Request & { componentData?: any } }) => {
        // 1. Try to get data from req.componentData (direct object, no serialization needed)
        // @ts-ignore - componentData is custom property we add in BFF
        if (request.componentData) {
            console.log('[BFF Mode] Data loaded from req.componentData');
            return request.componentData;
        }

        // 2. Try to get data from BFF via HTTP Header (fallback for cross-process scenarios)
        const bffDataHeader = request.headers.get(COMPONENT_DATA_HEADER);
        if (bffDataHeader) {
            try {
                // Decode and parse BFF data
                // BFF should send data as: encodeURIComponent(JSON.stringify(data))
                const decodedData = decodeURIComponent(bffDataHeader);
                const parsedData = JSON.parse(decodedData);
                console.log('[BFF Mode] Data loaded from header');
                return parsedData;
            } catch (error) {
                console.error('Failed to parse BFF data from header:', error);
            }
        }

        // 3. Development mode only: read from local data.json
        if (isDevMode()) {
            try {
                const absolutePath = path.resolve(jsonPath);
                const fileContent = await fs.readFile(absolutePath, 'utf-8');
                const data = JSON.parse(fileContent);
                console.log(`[Dev Mode] Data loaded from ${jsonPath}`);
                return data;
            } catch (error) {
                console.error(`Error loading ${jsonPath}:`, error);
                return {};
            }
        }

        // 4. Production mode: throw error if no data source available
        throw new Error(
            `[Production Mode] No data source available. ` +
            `Please ensure BFF passes data via req.componentData or x-component-data header.`
        );
    };
}

/**
 * Renders a Svelte 5 component to HTML using the Imperative Component API.
 * This function should be used with pre-compiled components.
 *
 * @param Component - The pre-compiled Svelte component
 * @param props - Props to pass to the component
 * @param options - Additional rendering options
 * @returns Rendered HTML result with head and body content
 */
export async function renderComponent(Component: any, props: Record<string, any> = {}, options: { data?: any } = {}) {
    try {
        console.log('[SSR] Rendering component with props:', Object.keys(props));

        // Use Svelte 5's render function from svelte/server
        const result = render(Component, {
            props: {
                ...props,
                // Pass additional data if provided
                ...(options.data || {})
            }
        });

        console.log('[SSR] Component rendered successfully');

        return {
            html: result.html,
            head: result.head,
            // Include initial data for hydration
            initialData: props
        };
    } catch (error) {
        console.error('[SSR] Error rendering component:', error);
        throw error;
    }
}

/**
 * Creates a mock loader that reads data from a JSON file.
 * @param jsonPath - Relative path to the JSON file from the project root (e.g., 'data.json').
 * @deprecated Use createDataLoader instead for better BFF integration
 * @returns A data loading function.
 */
export function createMockLoader(jsonPath: string, key?: string) {
    return async () => {
        try {
            // Resolve the path relative to the current working directory (which should be the component root)
            const absolutePath = path.resolve(jsonPath);
            const fileContent = await fs.readFile(absolutePath, 'utf-8');
            const data = JSON.parse(fileContent);

            if (key) {
                return {
                    [key]: data
                };
            }

            return {
                ...data
            };
        } catch (error) {
            console.error(`Error loading ${jsonPath}:`, error);
            return {};
        }
    };
}

/**
 * 基于 IndexedDB 的远程内容缓存（htmlUrl / cssUrl）。
 * 请求前先查缓存，命中则直接使用，未命中再请求并写入缓存，避免重复请求。
 */

const DB_NAME = 'pep-cloud-deploy-flow-remote-content';
const STORE_NAME = 'urlContent';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
        return Promise.reject(new Error('IndexedDB is not available'));
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            }
        };
    });
}

export interface CachedEntry {
    url: string;
    content: string;
    cachedAt: number;
}

/**
 * 根据 URL 从缓存中读取内容。若该 URL 未缓存则返回 null。
 */
export async function getCachedContent(url: string): Promise<string | null> {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(url);
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
            request.onsuccess = () => {
                db.close();
                const entry = request.result as CachedEntry | undefined;
                resolve(entry?.content ?? null);
            };
        });
    } catch {
        return null;
    }
}

/**
 * 将 URL 与内容写入缓存。
 */
export async function setCachedContent(url: string, content: string): Promise<void> {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const entry: CachedEntry = { url, content, cachedAt: Date.now() };
            const request = store.put(entry);
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
            request.onsuccess = () => {
                db.close();
                resolve();
            };
        });
    } catch {
        // 写入失败仅忽略，不影响主流程
    }
}

/**
 * 根据 URL 拉取文本：先查缓存，命中则返回缓存内容；未命中则 fetch 后写入缓存再返回。
 */
export async function fetchWithCache(url: string): Promise<string> {
    const cached = await getCachedContent(url);
    if (cached != null) {
        return cached;
    }
    const resp = await fetch(url);
    const text = await resp.text();
    await setCachedContent(url, text);
    return text;
}

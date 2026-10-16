/**
 * A tiny TTL cache for GET-style API responses.
 *
 * Why not React Query / SWR? For a project this size a full data-fetching
 * library is more than we need, and pulling one in would mean rewriting
 * every page's loading/error state at once. This gives the same practical
 * win (skip refetching things you already have) with zero dependencies.
 * If the project grows, swapping this out for React Query later is a
 * drop-in change since it's isolated to `request()` in movieApi.ts.
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, CacheEntry<unknown>>();

function readFromSession<T>(key: string): CacheEntry<T> | null {
    try {
        const raw = sessionStorage.getItem(sessionKey(key));
        return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
    } catch {
        return null;
    }
}

function writeToSession<T>(key: string, entry: CacheEntry<T>): void {
    try {
        sessionStorage.setItem(sessionKey(key), JSON.stringify(entry));
    } catch {
        // sessionStorage can throw in private-browsing modes or when full.
        // The in-memory cache still works, so this is safe to ignore.
    }
}

function sessionKey(key: string): string {
    return `tmdb-cache:${key}`;
}

export function getCached<T>(key: string): T | null {
    const now = Date.now();

    const inMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (inMemory && inMemory.expiresAt > now) {
        return inMemory.value;
    }

    const inSession = readFromSession<T>(key);
    if (inSession && inSession.expiresAt > now) {
        memoryCache.set(key, inSession);
        return inSession.value;
    }

    return null;
}

export function setCached<T>(
    key: string,
    value: T,
    ttlMs: number = DEFAULT_TTL_MS
): void {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    memoryCache.set(key, entry);
    writeToSession(key, entry);
}

export function clearCache(): void {
    memoryCache.clear();

    try {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith("tmdb-cache:"))
            .forEach((key) => sessionStorage.removeItem(key));
    } catch {
        // ignore
    }
}

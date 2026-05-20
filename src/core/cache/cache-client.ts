class CacheClient {
    private store = new Map<string, { value: any; expiresAt: number }>();

    async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value as T;
    }

    async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }
}

export const cache = new CacheClient();

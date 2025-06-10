import { Injectable } from '@angular/core';
import { CACHEABLE_ENDPOINTS, CachePolicy } from './cache.config';
import { IndexedDBCacheService } from './indexeddb.cahce.service';

interface CachedItem {
  data: any;
  timestamp: number;
  ttl?: number;
  persistUntilLogout?: boolean;
  storedIn?: 'localStorage' | 'indexedDB';
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private storage = localStorage;
  private sizeThreshold = 2 * 1024 * 1024; // 2 MB

  constructor(private indexedDb: IndexedDBCacheService) { }

  async get(key: string): Promise<any> {
    const localItem = this.storage.getItem(key);

    if (localItem) {
      try {
        const parsed: CachedItem = JSON.parse(localItem);
        if (parsed.persistUntilLogout) return parsed.data;
        if (parsed.ttl && Date.now() > parsed.timestamp + parsed.ttl) {
          this.clear(key);
          return null;
        }
        return parsed.data;
      } catch (err) {
        console.warn(`Failed to parse localStorage cache for ${key}`, err);
        this.clear(key);
      }
    }

    // Fallback to IndexedDB
    const dbItem = await this.indexedDb.get(key);
    return dbItem;
  }

  

  async set(
    key: string,
    data: any,
    options: { ttl?: number; persistUntilLogout?: boolean } = {}
  ): Promise<void> {
    const item: CachedItem = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
      persistUntilLogout: options.persistUntilLogout,
    };

    const serialized = JSON.stringify(item);
    const size = new Blob([serialized]).size;
    console.log(`[cache] Size of ${key}: ${(size / 1024).toFixed(2)} KB`, size, serialized);
    try {
      if (size > this.sizeThreshold) {
        // Store in IndexedDB
        await this.indexedDb.set(key, item);
        this.storage.removeItem(key); // Clean from localStorage
        console.log(`[cache] Stored ${key} in IndexedDB (${(size / 1024).toFixed(2)} KB)`);
      } else {
        // Store in localStorage
        this.storage.setItem(key, serialized);
        console.log(`[cache] Stored ${key} in localStorage (${(size / 1024).toFixed(2)} KB)`);
      }
    } catch (err) {
      console.error('Cache storage failed:', err);
    }
  }

  clear(key: string): void {
    this.storage.removeItem(key);
    this.indexedDb.clear(key); // Fire-and-forget
  }

  clearAll(): void {
    Object.keys(this.storage).forEach(key => {
      const item = this.storage.getItem(key);
      if (!item?.includes('"persistUntilLogout":true')) {
        this.storage.removeItem(key);
      }
    });
    // Optional: clear IndexedDB fully if needed (not shown here)
    this.indexedDb.clearAll();
  }

  clearPersistentCache(): void {
    Object.keys(this.storage).forEach(key => {
      const item = this.storage.getItem(key);
      if (item?.includes('"persistUntilLogout":true')) {
        this.storage.removeItem(key);
      }
    });
  }


  getCachePolicy(url: string): CachePolicy | undefined {
    // Retrieve the cache policy for a given endpoint
    // Example:
    const match = Object.keys(CACHEABLE_ENDPOINTS).find(key => url.includes(key));
    return match ? CACHEABLE_ENDPOINTS[match] : undefined;
  }
}

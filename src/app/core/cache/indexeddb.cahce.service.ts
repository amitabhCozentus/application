import { Injectable } from '@angular/core';
import { set, get, del,clear } from 'idb-keyval';
import * as LZString from 'lz-string';

@Injectable({ providedIn: 'root' })
export class IndexedDBCacheService {
  async set(key: string, data: any): Promise<void> {
    console.log(`[cache] Setting IndexedDB cache for ${key}`);
    const compressed = LZString.compress(JSON.stringify(data));
    await set(key, compressed);
  }

  async get(key: string): Promise<any | null> {
    try {
      const compressed = await get(key);
      if (!compressed) return null;
      const decompressed = LZString.decompress(compressed);
      return decompressed ? JSON.parse(decompressed) : null;
    } catch (err) {
      console.error(`IndexedDB get operation failed for ${key}:`, err);
      return null;
    }
  }

  async clear(key: string): Promise<void> {
    await del(key);
  }

  async clearAll(): Promise<void> {
    await clear();
  }
  
}

// core/services/cache/cache-config.ts
export interface CachePolicy {
  ttl?: number;           // Time-to-live in milliseconds
  persistUntilLogout?: boolean; // Cache persists until user logs out
}

export const CACHEABLE_ENDPOINTS: { [url: string]: CachePolicy } = {
  "common/hierarchy/port-list": { persistUntilLogout: true },
  "common/ports": { persistUntilLogout: true },
  // '/api/user/notifications': { ttl: 60000 }, // 1 minute
};

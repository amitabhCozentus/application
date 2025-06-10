# API Request Interceptor - Caching and Force Refresh Mechanism

## 1. Overview

This API request interceptor is responsible for caching API responses to improve application performance. It intercepts requests made by the application and determines whether the data should be fetched from the cache or the server. Caching works for both `GET` and `POST` methods. The mechanism also supports cache invalidation with the `forceRefresh` flag, allowing developers to bypass the cache when necessary.

## 2. How It Works (Step-by-Step)

### Step 1: Intercepting the Request

- The `ApiRequestInterceptor` intercepts HTTP requests made by the application.
- It checks whether the request is made to a known cacheable endpoint and whether a `forceRefresh` flag is present.
- **Request Cloning:** If the request URL does not start with `http` or `https`, the interceptor adds the base URL and necessary headers, including the `Authorization` token if available.

### Step 2: Checking for Cache Policy

- For every intercepted request, the URL is compared with the list of **cacheable endpoints** defined in `CACHEABLE_ENDPOINTS`.
- **Cacheable URL:** If the URL matches a cacheable endpoint, the cache policy defined for that endpoint is retrieved. This policy determines how long the response should be cached (e.g., persistent until logout, TTL-based expiration).
  
### Step 3: Force Refresh Logic

- If the request contains either:
  - The query parameter `forceRefresh=true`, or
  - The header `x-force-refresh=true`,
  
  The cache is **bypassed**, and fresh data is always fetched from the server. The `forceRefresh` flag is removed from the request before forwarding it to the backend.
  
- If no `forceRefresh` flag is present, the interceptor proceeds to check if the data for the request is cached.

### Step 4: Checking the Cache

- If a cache policy is found for the URL and `forceRefresh` is not set, the interceptor checks the cache (localStorage or IndexedDB) for previously cached data.
- **Cache Hit:** If cached data is found, it is returned immediately as an HTTP response with a status of `200`.
  
- **Cache Miss:** If no cached data is found, the request is sent to the backend. The response will be cached based on the provided cache policy once it is received.

### Step 5: Cloning the Request with Cache Policy

- If the data is not found in the cache, the request is cloned, and the `x-cache-policy` header is added to the request. This header tells the server how to handle caching the response once it is returned.
- The request is forwarded to the server for processing.

### Step 6: Handling the Response

- Once the server responds, the interceptor will decide whether to cache the response based on the cache policy (TTL, persistent until logout, etc.).
  
---

## 3. Configuration - Step-by-Step

### Step 1: Define Cacheable Endpoints

To define cacheable endpoints and their cache policies, you need to update the `CACHEABLE_ENDPOINTS` object in the `cache.config.ts` file. This object holds the URLs of the endpoints that should be cached along with their associated `CachePolicy`.

#### Example:

```ts
export const CACHEABLE_ENDPOINTS: { [url: string]: CachePolicy } = {
  "common/hierarchy/port-list": { persistUntilLogout: true },
  "common/ports": { persistUntilLogout: true },
  "/api/user/notifications": { ttl: 60000 },  // Cache for 1 minute
  "/api/user/profile": { ttl: 3600000 }  // Cache for 1 hour
};

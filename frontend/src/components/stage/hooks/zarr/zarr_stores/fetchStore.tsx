// Must stay a type-only import: `import { type X }` keeps the module side-effect under
// verbatimModuleSyntax, which pulls @zarrita/storage's Node-only FileSystemStore (fs.js)
// into the browser bundle and breaks the build.
import type { AbsolutePath } from '@zarrita/storage';
import { FetchStore } from 'zarrita';
import { LRUCache } from '../caches/in_memory_lru';

class AsyncLockManager<T> {
  private locks = new Map<string, Promise<T>>();

  async withLock(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.locks.has(key)) {
      return await this.locks.get(key)!;
    }

    const promise = fn().finally(() => {
      this.locks.delete(key);
    });

    this.locks.set(key, promise);
    return await promise;
  }
}

export class HTTPError extends Error {
  __zarr__: string;
  constructor(code: string | undefined) {
    super(code);
    this.__zarr__ = 'HTTPError';
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export class KeyError extends Error {
  __zarr__: string;

  constructor(key: string | undefined) {
    super(`key ${key} not present`);
    this.__zarr__ = 'KeyError';
    Object.setPrototypeOf(this, KeyError.prototype);
  }
}

export function joinUrlParts(...args: string[]) {
  return args
    .map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[/]*$/g, '');
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, '');
      }
    })
    .filter((x) => x.length)
    .join('/');
}

function resolve(root: string | URL, path: AbsolutePath): URL {
  const base = typeof root === 'string' ? new URL(root) : root;
  if (!base.pathname.endsWith('/')) {
    // ensure trailing slash so that base is resolved as _directory_
    base.pathname += '/';
  }
  const resolved = new URL(path.slice(1), base);
  // copy search params to new URL
  resolved.search = base.search;
  return resolved;
}

async function handle_response(
  response: Response,
): Promise<Uint8Array | undefined> {
  if (response.status === 404) {
    return undefined;
  }
  if (response.status === 200 || response.status === 206) {
    return new Uint8Array(await response.arrayBuffer());
  }
  throw new Error(
    `Unexpected response status ${response.status} ${response.statusText}`,
  );
}

const global_cache = new LRUCache<string, ArrayBuffer>(500);

type FetchStoreOptions = NonNullable<
  ConstructorParameters<typeof FetchStore>[1]
>;

export class CachedFetchStore extends FetchStore {
  private cache: LRUCache<string, ArrayBuffer>;
  private lockManager: AsyncLockManager<Uint8Array | undefined>;

  constructor(url: string, options: FetchStoreOptions = {}) {
    super(url, options);
    this.url = url;
    this.cache = global_cache;
    this.lockManager = new AsyncLockManager<Uint8Array | undefined>();
  }

  async get(key: AbsolutePath, options: RequestInit = {}) {
    const cacheKey = key + this.url;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return new Uint8Array(cached);
    }

    // Use async lock to prevent duplicate requests
    return this.lockManager.withLock(cacheKey, async () => {
      // Double-check cache in case another request filled it
      const cachedAfterLock = this.cache.get(cacheKey);
      if (cachedAfterLock) {
        return new Uint8Array(cachedAfterLock);
      }

      const href = resolve(this.url, key).href;
      const response = await fetch(href, { ...options });
      const result = await handle_response(response);

      if (result) {
        // Cache the result - convert to ArrayBuffer if it's not already
        const bufferToCache =
          result instanceof Uint8Array
            ? result.buffer.slice(
                result.byteOffset,
                result.byteOffset + result.byteLength,
              )
            : result;
        this.cache.set(cacheKey, bufferToCache as ArrayBuffer);
      }

      return result;
    });
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: this.cache.getMaxSize(),
    };
  }

  // Check if an item is cached
  isCached(key: string): boolean {
    return this.cache.has(key) || this.cache.has(`getItem:${key}`);
  }
}

export interface Zattrs {
  fileversion: string;
}

export interface Zgroup {
  zarr_format: number;
}

export interface Compressor {
  blocksize: number;
  clevel: number;
  cname: string;
  id: string;
  shuffle: number;
}

export interface DataZarray {
  chunks: number[];
  compressor: Compressor;
  dtype: string;
  fill_value: string;
  filters?: Record<string, unknown>[] | null;
  order: string;
  shape: number[];
  zarr_format: number;
}

export interface DataZattrs {
  _ARRAY_DIMENSIONS: string[];
}

export interface Metadata {
  '.zattrs': Zattrs;
  '.zgroup': Zgroup;
  'data/.zarray': DataZarray;
  'data/.zattrs': DataZattrs;
}

export interface XArrayMetadata {
  metadata: Metadata;
  zarr_consolidated_format: number;
}

// NOTE: `getAxisLabelsAndChannelAxis` and `SelectionLoader` used to live here. Both were
// dead (referenced nowhere) and both referred to a `ZarrArray` type that does not exist in
// this codebase, so they could never have compiled. Removed.

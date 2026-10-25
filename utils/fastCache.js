import crypto from "crypto";

class FastMemoryCache {
  constructor() {
    this.store = new Map();
  }

  generateETag(bodyString) {
    return `W/"${crypto.createHash("md5").update(bodyString).digest("hex").slice(0, 16)}"`;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  set(key, data, ttlSeconds = 300) {
    const jsonString = JSON.stringify(data);
    const etag = this.generateETag(jsonString);
    const expiry = Date.now() + ttlSeconds * 1000;

    const entry = {
      data,
      jsonString,
      etag,
      expiry,
    };

    this.store.set(key, entry);
    return entry;
  }

  delete(key) {
    return this.store.delete(key);
  }

  clearNamespace(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix) || key.startsWith("home:feed")) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  clearAll() {
    this.store.clear();
  }

  /**
   * Ultra-fast cached responder:
   * Serves directly from V8 memory in ~0.003ms (microseconds) on cache hit.
   * Emits ETag and standard Edge/Browser Cache-Control headers.
   */
  async sendCached(req, res, cacheKey, fetcher, ttlSeconds = 300) {
    const startHr = process.hrtime.bigint();

    // 1. Try RAM Cache
    const cached = this.get(cacheKey);
    if (cached) {
      const durationMs = Number(process.hrtime.bigint() - startHr) / 1e6;

      // Conditional GET (HTTP 304 Not Modified)
      if (req.headers["if-none-match"] === cached.etag) {
        res.setHeader("X-Cache", "HIT-304");
        res.setHeader("X-Response-Time", `${durationMs.toFixed(4)}ms`);
        return res.status(304).end();
      }

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("ETag", cached.etag);
      res.setHeader(
        "Cache-Control",
        `public, max-age=${Math.min(ttlSeconds, 120)}, s-maxage=${ttlSeconds}, stale-while-revalidate=86400`
      );
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Response-Time", `${durationMs.toFixed(4)}ms`);
      return res.status(200).send(cached.jsonString);
    }

    // 2. Cache Miss: Execute DB query
    const data = await fetcher();
    const durationMs = Number(process.hrtime.bigint() - startHr) / 1e6;

    // Cache the fresh result
    const stored = this.set(cacheKey, data, ttlSeconds);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("ETag", stored.etag);
    res.setHeader(
      "Cache-Control",
      `public, max-age=${Math.min(ttlSeconds, 120)}, s-maxage=${ttlSeconds}, stale-while-revalidate=86400`
    );
    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Response-Time", `${durationMs.toFixed(4)}ms`);
    return res.status(200).send(stored.jsonString);
  }
}

export const fastCache = new FastMemoryCache();

// Specific Cache Invalidation Helpers
export const invalidateProducts = () => {
  fastCache.clearNamespace("product:");
  fastCache.delete("home:feed");
};

export const invalidateBanners = () => {
  fastCache.clearNamespace("banner:");
  fastCache.delete("home:feed");
};

export const invalidateCategories = () => {
  fastCache.clearNamespace("category:");
  fastCache.delete("home:feed");
};

export const invalidateSubCategories = () => {
  fastCache.clearNamespace("subcategory:");
  fastCache.delete("home:feed");
};

export const invalidateFestivalOffers = () => {
  fastCache.clearNamespace("festivalOffer:");
  fastCache.delete("home:feed");
};

export const invalidateCoupons = () => {
  fastCache.clearNamespace("coupon:");
  fastCache.delete("home:feed");
};

export const invalidateAll = () => {
  fastCache.clearAll();
};

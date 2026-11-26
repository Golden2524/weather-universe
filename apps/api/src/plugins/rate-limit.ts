import type { FastifyReply, FastifyRequest } from "fastify"

interface RateLimitOptions {
  limit: number
  windowMs: number
  keyPrefix: string
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
let lastCleanup = 0

function clientKey(request: FastifyRequest, prefix: string) {
  // server.ts enables Fastify proxy trust for requests arriving through Render.
  return `${prefix}:${request.ip}`
}

export function rateLimit(options: RateLimitOptions) {
  return async function enforceRateLimit(request: FastifyRequest, reply: FastifyReply) {
    const now = Date.now()
    const key = clientKey(request, options.keyPrefix)
    let bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs }
      buckets.set(key, bucket)
    }

    bucket.count += 1
    const remaining = Math.max(0, options.limit - bucket.count)
    reply.header("X-RateLimit-Limit", options.limit)
    reply.header("X-RateLimit-Remaining", remaining)
    reply.header("X-RateLimit-Reset", Math.ceil(bucket.resetAt / 1000))

    if (bucket.count > options.limit) {
      reply.header("Retry-After", Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
      return reply.code(429).send({ error: "Too many requests. Please try again shortly." })
    }

    if (now - lastCleanup > options.windowMs) {
      lastCleanup = now
      for (const [bucketKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(bucketKey)
      }
    }
  }
}

import { Redis } from "ioredis"
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

const redisUrl = process.env.REDIS_URL
const redis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: 5_000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    })
  : undefined

const buckets = new Map<string, Bucket>()
let lastCleanup = 0

const incrementWithWindow = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return { count, redis.call("PTTL", KEYS[1]) }
`

/** Connect before the server starts so production never silently uses local counters. */
export async function connectRateLimitStore() {
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL is required in production for shared rate limiting")
    }
    return
  }

  await redis.connect()
  await redis.ping()
}

export async function closeRateLimitStore() {
  if (redis?.status === "ready") {
    await redis.quit()
  }
}

function clientKey(request: FastifyRequest, prefix: string) {
  // server.ts enables Fastify proxy trust for requests arriving through Render.
  return `${prefix}:${request.ip}`
}

function addRateLimitHeaders(reply: FastifyReply, limit: number, count: number, resetAt: number) {
  reply.header("X-RateLimit-Limit", limit)
  reply.header("X-RateLimit-Remaining", Math.max(0, limit - count))
  reply.header("X-RateLimit-Reset", Math.ceil(resetAt / 1000))
}

function enforceLocalLimit(
  request: FastifyRequest,
  reply: FastifyReply,
  options: RateLimitOptions,
  now: number
) {
  const key = clientKey(request, options.keyPrefix)
  let bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  addRateLimitHeaders(reply, options.limit, bucket.count, bucket.resetAt)

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

export function rateLimit(options: RateLimitOptions) {
  return async function enforceRateLimit(request: FastifyRequest, reply: FastifyReply) {
    const now = Date.now()

    if (!redis) {
      return enforceLocalLimit(request, reply, options, now)
    }

    const key = clientKey(request, options.keyPrefix)
    try {
      const [count, ttl] = await redis.eval(
        incrementWithWindow,
        1,
        key,
        String(options.windowMs)
      ) as [number, number]
      const resetAt = now + Math.max(0, ttl)
      addRateLimitHeaders(reply, options.limit, count, resetAt)

      if (count > options.limit) {
        reply.header("Retry-After", Math.max(1, Math.ceil(ttl / 1000)))
        return reply.code(429).send({ error: "Too many requests. Please try again shortly." })
      }
    } catch (error) {
      request.log.error({ err: error }, "Shared rate-limit store is unavailable")
      return reply.code(503).send({ error: "Request protection is temporarily unavailable. Please retry shortly." })
    }
  }
}

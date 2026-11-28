import { Redis } from "ioredis"

const redisUrl = process.env.REDIS_URL

export const sharedRedis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: 5_000,
      commandTimeout: 1_500,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    })
  : undefined

/** Connect before the server starts so production never silently uses local counters. */
export async function connectSharedRedis() {
  if (!sharedRedis) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL is required in production for shared rate limiting")
    }
    return
  }

  await sharedRedis.connect()
  await sharedRedis.ping()
}

export async function closeSharedRedis() {
  if (!sharedRedis) return
  if (sharedRedis.status === "ready") await sharedRedis.quit()
  else sharedRedis.disconnect()
}

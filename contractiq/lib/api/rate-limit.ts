type Bucket = 'process' | 'chat'

const WINDOW_MS = 60_000
const LIMITS: Record<Bucket, number> = { process: 10, chat: 30 }

interface WindowState {
  count: number
  windowStart: number
}

// Per-instance in-memory sliding window. Functional today (bounds abuse from
// a single serverless instance); Stage 7 (/security-foundation) can swap the
// store for a distributed one (e.g. Redis) behind this same function
// signature without touching call sites in process/route.ts or chat/route.ts.
const buckets = new Map<string, WindowState>()

export async function checkRateLimit(userId: string, bucket: Bucket): Promise<boolean> {
  const key = `${userId}:${bucket}`
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return true
  }

  if (existing.count >= LIMITS[bucket]) {
    return false
  }

  existing.count += 1
  return true
}

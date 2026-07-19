const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

/** 3-attempt exponential backoff around any OpenAI call. api-conventions.md §4. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseDelayMs = 500 }: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err
      const status = (err as { status?: number })?.status
      const isRetryable = status ? RETRYABLE_STATUS.has(status) : true
      if (!isRetryable || attempt === attempts - 1) throw err
      const delay = baseDelayMs * 2 ** attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

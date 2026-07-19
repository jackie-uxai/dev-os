export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

/**
 * Client-side fetch wrapper used by every React Query hook. Centralizes the
 * { error: { code, message } } envelope (api-conventions.md §2) and the
 * 401 -> redirect-to-sign-in behavior described in auth.md's edge cases.
 */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const redirectedFrom = window.location.pathname
      window.location.href = `/sign-in?redirectedFrom=${encodeURIComponent(redirectedFrom)}`
    }
    throw new ApiError('unauthenticated', 'Sign in to continue.', 401)
  }

  if (!res.ok) {
    let code = 'internal_error'
    let message = 'Something went wrong. Please try again.'
    try {
      const body = await res.json()
      if (body?.error) {
        code = body.error.code ?? code
        message = body.error.message ?? message
      }
    } catch {
      // response body wasn't JSON — keep the defaults
    }
    throw new ApiError(code, message, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

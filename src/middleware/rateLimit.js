import { ApiError } from '../utils/errors.js'

export function rateLimitMiddleware(bindingName) {
  return async (c, next) => {
    const limiter = c.env[bindingName]

    if (!limiter) {
      // binding not available locally, skip
      await next()
      return
    }

    // key = email if available in body, fallback to IP
    let key
    try {
      const body = await c.req.json()
      key = body?.email ?? c.req.header('cf-connecting-ip') ?? 'anonymous'
      // re-inject the body so downstream handlers can read it
      c.req.bodyCache = body
    } catch {
      key = c.req.header('cf-connecting-ip') ?? 'anonymous'
    }

    const { success } = await limiter.limit({ key })

    if (!success) {
      throw new ApiError(
        429,
        'TOO_MANY_REQUESTS',
        'Too many requests, please try again later.',
      )
    }

    await next()
  }
}

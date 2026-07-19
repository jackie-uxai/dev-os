import OpenAI from 'openai'

let client: OpenAI | null = null

/**
 * Lazily constructed so importing this module never throws at build time
 * (Next.js statically collects route module info during `next build`,
 * which would otherwise fail if OPENAI_API_KEY isn't set in the build
 * environment). The key is only required once a request actually needs it.
 */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}

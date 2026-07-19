const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /override (your|the) rules/i,
  /reveal (system prompt|system instructions)/i,
  /print (your )?instructions/i,
  /expose (env variables|environment variables|api keys)/i,
  /show (env variables|environment variables|api keys)/i,
  /you are now a/i,
  /act as/i,
  /pretend you are/i,
  /jailbreak/i,
  /dan mode/i,
  /developer mode/i,
]

export function sanitizeForLLM(message: string): string {
  const normalized = message.trim()

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error('prompt_injection_detected')
    }
  }

  return normalized
}

export function isPromptInjection(message: string): boolean {
  const normalized = message.trim()
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(normalized))
}

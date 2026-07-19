import { encode } from 'gpt-tokenizer'

/** gpt-tokenizer's default export is o200k_base — the GPT-4o encoding. */
export function countTokens(text: string): number {
  return encode(text).length
}

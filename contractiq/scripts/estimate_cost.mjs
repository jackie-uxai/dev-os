import fs from 'fs'
import { encode } from 'gpt-tokenizer'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/estimate_cost.mjs <path-to-text-file> [--in-price=0.00] [--out-price=0.00] [--prompt-overhead=1000]')
  process.exit(2)
}

const filePath = args[0]
const opts = Object.fromEntries(args.slice(1).map((a) => {
  const m = a.match(/^--([a-z-]+)=(.*)$/)
  if (!m) return [a, true]
  return [m[1], m[2]]
}))

const inPricePer1k = Number(opts['in-price'] ?? 0.0) // $ per 1k input tokens
const outPricePer1k = Number(opts['out-price'] ?? 0.0) // $ per 1k output tokens
const promptOverhead = Number(opts['prompt-overhead'] ?? 1000)

const text = fs.readFileSync(filePath, 'utf8')
const tokenCount = encode(text).length

// App defaults (from codebase)
const MAX_CONTRACT_TOKENS = 15000
const extractionMaxOutput = 2000 // extract-key-terms max_completion_tokens
const chatMaxOutput = 1000 // chat completion max

// Estimates
const extractionInputTokens = Math.min(tokenCount, MAX_CONTRACT_TOKENS) + promptOverhead
const extractionTotalTokens = extractionInputTokens + extractionMaxOutput
const chatInputTokens = Math.min(tokenCount, MAX_CONTRACT_TOKENS) + 0 // chat prompt overhead small
const chatTotalTokens = chatInputTokens + chatMaxOutput
const totalTokensPerContract = extractionTotalTokens + chatTotalTokens

function costFromTokens(tokens, pricePer1k) {
  return (tokens / 1000) * pricePer1k
}

const extractionCost = costFromTokens(extractionInputTokens, inPricePer1k) + costFromTokens(extractionMaxOutput, outPricePer1k)
const chatCost = costFromTokens(chatInputTokens, inPricePer1k) + costFromTokens(chatMaxOutput, outPricePer1k)
const totalCost = extractionCost + chatCost

console.log('Token and cost estimate for:', filePath)
console.log('----------------------------------------')
console.log('Raw token count of contract text:', tokenCount)
console.log('Assumed prompt overhead tokens (approx):', promptOverhead)
console.log('Extraction call: input tokens:', extractionInputTokens, 'output tokens:', extractionMaxOutput, '=> total', extractionTotalTokens)
console.log('Chat call: input tokens:', chatInputTokens, 'output tokens:', chatMaxOutput, '=> total', chatTotalTokens)
console.log('Estimated tokens per contract (extraction + one chat):', totalTokensPerContract)

console.log('')
console.log('Pricing inputs: (in-price per 1k tokens) =', inPricePer1k, ' (out-price per 1k tokens) =', outPricePer1k)
console.log('Estimated cost — extraction:', extractionCost.toFixed(6))
console.log('Estimated cost — chat:', chatCost.toFixed(6))
console.log('Estimated total cost per contract:', totalCost.toFixed(6))
console.log('')
console.log('Notes:')
console.log('- These are estimates. Actual token usage depends on exact prompt framing and model billing semantics.')
console.log("- To get accurate costs, plug your provider's per-1k-token prices (input/output) via '--in-price' and '--out-price'.")
console.log("Example:")
console.log("  node scripts/estimate_cost.mjs /tmp/contract.txt --in-price=0.03 --out-price=0.06 --prompt-overhead=1200")

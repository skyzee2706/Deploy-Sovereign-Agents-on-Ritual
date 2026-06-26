import { encodeAbiParameters, parseAbiParameters, keccak256, toHex } from 'viem'
import { encryptSecrets } from './ecies'

export interface DeployConfig {
  llmProvider: 'openrouter' | 'openai' | 'anthropic' | 'gemini'
  apiKey: string
  hfToken: string
  hfRepoId: string
  model: string
  agentPrompt: string
  salt: string
  frequency: number
  cliType: number
}

export async function buildDeployCalldata(
  config: DeployConfig,
  executorAddress: string,
  executorPubKeyHex: string,
  harnessAddress: string,
): Promise<`0x${string}`> {
  // Build credentials object to encrypt
  const providerKeyMap: Record<string, string> = {
    openrouter: 'OPENROUTER_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
  }
  const secrets: Record<string, string> = {
    LLM_PROVIDER: config.llmProvider,
    [providerKeyMap[config.llmProvider]]: config.apiKey,
    HF_TOKEN: config.hfToken,
  }

  const encryptedUint8 = await encryptSecrets(executorPubKeyHex, secrets)
  const encryptedHex = '0x' + Buffer.from(encryptedUint8).toString('hex') as `0x${string}`
  
  const deliverySelector = keccak256(toHex('onSovereignAgentResult(bytes32,bytes)')).slice(0, 10) as `0x${string}`

  // 1-call window needs 10000 bps
  const rolloverBps = 10000
  const windowNumCalls = 1

  const schedule = [500000n, BigInt(config.frequency), 500n, 20000000000n, 1000000000n, 0n] as const
  const rolling = [windowNumCalls, rolloverBps, 1] as const
  const lockDuration = 100_000_000n

  // configureFundAndStart selector
  const selector = '0xb1906702'

  // Build params tuple
  const params = [
    executorAddress,       // executor
    500n,                  // ttl
    '0x' as `0x${string}`, // userPublicKey (empty)
    5n,                    // pollIntervalBlocks
    6000n,                 // maxPollBlock
    'SOVEREIGN_AGENT_TASK',// taskIdMarker
    harnessAddress,        // deliveryTarget
    deliverySelector,      // deliverySelector
    3000000n,              // deliveryGasLimit
    1000000000n,           // deliveryMaxFeePerGas
    100000000n,            // deliveryMaxPriorityFeePerGas
    BigInt(config.cliType),// cliType
    config.agentPrompt,    // prompt
    encryptedHex,          // encryptedSecrets (bytes)
    ['hf', `${config.hfRepoId}/sessions/session-001.jsonl`, 'HF_TOKEN'],  // convoHistory
    ['hf', `${config.hfRepoId}/artifacts/`, 'HF_TOKEN'],                   // output
    [] as any[],           // skills
    ['hf', `${config.hfRepoId}/prompts/default-system.md`, ''],            // systemPrompt
    config.model,          // model
    [] as string[],        // tools
    50n,                   // maxTurns
    8192n,                 // maxTokens
    '',                    // rpcUrls
  ]

  const encoded = encodeAbiParameters(
    parseAbiParameters([
      '(address,uint256,bytes,uint64,uint64,string,address,bytes4,uint256,uint256,uint256,uint16,string,bytes,(string,string,string),(string,string,string),(string,string,string)[],(string,string,string),string,string[],uint16,uint32,string)',
      '(uint32,uint32,uint32,uint256,uint256,uint256)',
      '(uint32,uint16,uint16)',
      'uint256',
    ]),
    [params as any, schedule as any, rolling as any, lockDuration]
  )

  return (selector + encoded.slice(2)) as `0x${string}`
}

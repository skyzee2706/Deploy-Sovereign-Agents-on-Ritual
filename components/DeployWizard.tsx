'use client'
import { useState } from 'react'
import { useAccount, useWriteContract, useSendTransaction, usePublicClient } from 'wagmi'
import { parseEther, keccak256, toHex, stringToHex, pad } from 'viem'
import { SOVEREIGN_FACTORY, FACTORY_ABI, GOLDEN_NODE } from '@/lib/contracts'
import { buildDeployCalldata, DeployConfig } from '@/lib/deploy'

export function DeployWizard() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { sendTransactionAsync } = useSendTransaction()

  // State
  const [step, setStep] = useState(1)
  const [isDeploying, setIsDeploying] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [deployedHarness, setDeployedHarness] = useState('')

  // Form Data
  const [config, setConfig] = useState<DeployConfig>({
    llmProvider: 'gemini',
    apiKey: '',
    hfToken: '',
    hfRepoId: '',
    model: 'gemini-2.5-flash',
    agentPrompt: 'You are a sovereign AI intelligence deployed on Ritual Chain...',
    salt: 'my-sovereign-agent',
    frequency: 10000,
    cliType: 5,
  })
  const [fundAmount, setFundAmount] = useState('0.1')

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const handleDeploy = async () => {
    if (!address || !publicClient) return
    setIsDeploying(true)
    setStatusMsg('Predicting harness address...')

    try {
      // 1. Predict Harness
      const userSalt = pad(stringToHex(config.salt), { size: 32 })
      const [harnessAddr] = await publicClient.readContract({
        address: SOVEREIGN_FACTORY,
        abi: FACTORY_ABI,
        functionName: 'predictHarness',
        args: [address, userSalt]
      })

      // 1.5. Check if already deployed
      const bytecode = await publicClient.getBytecode({ address: harnessAddr })
      if (bytecode && bytecode !== '0x') {
        setStatusMsg('Harness already deployed with this salt. Skipping deploy...')
      } else {
        // 2. Deploy Harness (Transaction 1)
        setStatusMsg('Deploying Harness (Please sign in wallet)...')
        const txDeploy = await writeContractAsync({
          address: SOVEREIGN_FACTORY,
          abi: FACTORY_ABI,
          functionName: 'deployHarness',
          args: [userSalt]
        })
        setStatusMsg(`Waiting for deployment TX: ${txDeploy.slice(0, 8)}...`)
        await publicClient.waitForTransactionReceipt({ hash: txDeploy })
      }

      // 3. Build configure calldata (ECIES encryption happens here)
      setStatusMsg('Encrypting secrets and building config...')
      // We hardcode Golden Node pubkey for now (as in python script)
      const goldenNodePubKey = "0x04bd8439486c9e03d360fa4e157790b4dfec65e4e70e947b19a16a4d70b4716768a4175b2210a44274c44f31cce167f259740a1eb58a964ce2857beaeec7fbd9d7"
      
      const calldata = await buildDeployCalldata(config, GOLDEN_NODE, goldenNodePubKey, harnessAddr)

      // 4. Configure and Fund (Transaction 2)
      setStatusMsg('Configuring and Funding (Please sign configuration TX)...')
      
      const txConfig = await sendTransactionAsync({
        to: harnessAddr,
        value: parseEther(fundAmount),
        data: calldata
      })

      setStatusMsg(`Waiting for config TX: ${txConfig.slice(0, 8)}...`)
      await publicClient.waitForTransactionReceipt({ hash: txConfig })

      setDeployedHarness(harnessAddr)
      setStatusMsg('')
      setStep(5) // Success step
    } catch (err: any) {
      console.error(err)
      setStatusMsg(`Error: ${err.message || String(err)}`)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto mt-8">
      {/* Steps Header */}
      <div className="steps">
        {[1,2,3,4].map(num => (
          <div key={num} className={`step ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
            Step {num}
          </div>
        ))}
      </div>

      {/* Step 1: LLM */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">LLM Configuration</h2>
          <div className="form-group">
            <label className="form-label">Provider</label>
            <select 
              className="form-select"
              value={config.llmProvider}
              onChange={(e) => setConfig({...config, llmProvider: e.target.value as any})}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input 
              type="password"
              className="form-input"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              placeholder="Your provider API key..."
            />
            <span className="form-hint">Encrypted locally. Only the Golden Node TEE can decrypt this.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Model Name</label>
            <input 
              type="text"
              className="form-input"
              value={config.model}
              onChange={(e) => setConfig({...config, model: e.target.value})}
            />
          </div>
          <button className="btn-primary mt-4" onClick={handleNext} disabled={!config.apiKey}>Next</button>
        </div>
      )}

      {/* Step 2: HuggingFace */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Storage (HuggingFace)</h2>
          <div className="form-group">
            <label className="form-label">HuggingFace Token (Write Access)</label>
            <input 
              type="password"
              className="form-input"
              value={config.hfToken}
              onChange={(e) => setConfig({...config, hfToken: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">HF Repo ID</label>
            <input 
              type="text"
              className="form-input"
              value={config.hfRepoId}
              onChange={(e) => setConfig({...config, hfRepoId: e.target.value})}
              placeholder="Username/RepoName"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button className="btn-primary bg-gray-700 hover:bg-gray-600" onClick={handlePrev}>Back</button>
            <button className="btn-primary" onClick={handleNext} disabled={!config.hfToken || !config.hfRepoId}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Agent Config */}
      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Agent Identity & Schedule</h2>
          <div className="form-group">
            <label className="form-label">Agent Name (Salt)</label>
            <input 
              type="text"
              className="form-input"
              value={config.salt}
              onChange={(e) => setConfig({...config, salt: e.target.value})}
            />
            <span className="form-hint">Must be unique per wallet to deploy a new agent.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Heartbeat Frequency (Blocks)</label>
            <select 
              className="form-select"
              value={config.frequency}
              onChange={(e) => setConfig({...config, frequency: parseInt(e.target.value)})}
            >
              <option value={2000}>Every 2000 Blocks (~6.3 mins)</option>
              <option value={5000}>Every 5000 Blocks (~15.8 mins)</option>
              <option value={10000}>Every 10000 Blocks (~31.7 mins)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">System Prompt</label>
            <textarea 
              className="form-textarea"
              rows={4}
              value={config.agentPrompt}
              onChange={(e) => setConfig({...config, agentPrompt: e.target.value})}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button className="btn-primary bg-gray-700 hover:bg-gray-600" onClick={handlePrev}>Back</button>
            <button className="btn-primary" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Deploy */}
      {step === 4 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Review & Deploy</h2>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 mb-6 text-sm">
            <p><strong>Provider:</strong> {config.llmProvider}</p>
            <p><strong>Model:</strong> {config.model}</p>
            <p><strong>HF Repo:</strong> {config.hfRepoId}</p>
            <p><strong>Frequency:</strong> {config.frequency} blocks</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Initial Funding (RITUAL)</label>
            <input 
              type="number"
              step="0.05"
              className="form-input"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
          </div>

          {statusMsg && (
            <div className="p-4 mb-4 bg-purple-900/20 border border-purple-500/50 rounded-lg text-purple-300 text-center animate-pulse">
              {statusMsg}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button className="btn-primary bg-gray-700 hover:bg-gray-600" onClick={handlePrev} disabled={isDeploying}>Back</button>
            <button className="btn-primary" onClick={handleDeploy} disabled={!isConnected || isDeploying}>
              {isDeploying ? 'Deploying...' : 'Sign & Deploy (2 TXs)'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">Agent Deployed!</h2>
          <p className="text-gray-400 mb-6">Your Sovereign Agent is now live on Ritual Chain.</p>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6 break-all">
            <span className="text-gray-500 block mb-1">Harness Address:</span>
            <strong className="text-white text-lg">{deployedHarness}</strong>
          </div>

          <a 
            href={`https://explorer.ritualfoundation.org/address/${deployedHarness}`}
            target="_blank"
            className="btn-primary inline-block text-center"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  )
}

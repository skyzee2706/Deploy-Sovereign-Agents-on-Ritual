'use client'
import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { RITUAL_WALLET_ABI } from '@/lib/contracts'

const COST_PER_HB = 0.0005 // RITUAL
const BLOCK_TIME_S = 0.19

export function TopupForm() {
  const { isConnected } = useAccount()
  const [harnessAddress, setHarnessAddress] = useState('')
  const [fundAmount, setFundAmount] = useState('0.1')
  
  // Predict RitualWallet address: it is the same as the harness address for the agent contract
  const isValidAddress = harnessAddress.startsWith('0x') && harnessAddress.length === 42

  const { data: balanceWei, refetch } = useReadContract({
    address: isValidAddress ? harnessAddress as `0x${string}` : undefined,
    abi: RITUAL_WALLET_ABI,
    functionName: 'balanceOf',
    args: [isValidAddress ? harnessAddress as `0x${string}` : '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: isValidAddress,
    }
  })

  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract()

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidAddress || !fundAmount) return

    writeContract({
      address: harnessAddress as `0x${string}`,
      abi: RITUAL_WALLET_ABI,
      functionName: 'depositFor',
      args: [harnessAddress as `0x${string}`, 100_000_000n],
      value: parseEther(fundAmount),
    })
  }

  // Calculate estimates
  let balanceRitual = 0
  let heartbeats = 0
  let days = 0
  if (balanceWei) {
    balanceRitual = parseFloat(formatEther(balanceWei as bigint))
    heartbeats = Math.floor(balanceRitual / COST_PER_HB)
    const minutesPerHB = (10000 * BLOCK_TIME_S) / 60
    days = (heartbeats * minutesPerHB) / 60 / 24
  }

  return (
    <div className="card max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Top Up Harness</h2>
      
      <form onSubmit={handleTopup}>
        <div className="form-group">
          <label className="form-label">Harness Address</label>
          <input
            className="form-input"
            placeholder="0x..."
            value={harnessAddress}
            onChange={(e) => setHarnessAddress(e.target.value)}
            required
          />
        </div>

        {isValidAddress && balanceWei !== undefined && (
          <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Current Balance</span>
              <span className="font-bold text-white">{balanceRitual.toFixed(4)} RITUAL</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Est. Heartbeats (10K freq)</span>
              <span className="font-bold text-white">~{heartbeats} times</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Lifespan</span>
              <span className="font-bold text-white">~{days.toFixed(1)} days</span>
            </div>
            <button type="button" onClick={() => refetch()} className="text-purple-400 text-sm mt-2 hover:underline">
              Refresh Balance
            </button>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Amount to Fund (RITUAL)</label>
          <input
            className="form-input"
            type="number"
            step="0.001"
            min="0"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            required
          />
        </div>

        {!isConnected ? (
          <p className="text-center text-red-400 mb-4">Please connect your wallet first.</p>
        ) : (
          <button
            type="submit"
            className="btn-primary"
            disabled={!isValidAddress || isPending}
          >
            {isPending ? 'Confirming in Wallet...' : 'Deposit Funds'}
          </button>
        )}

        {isSuccess && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 text-center">
            Top-up successful! <br/>
            <a href={`https://explorer.ritualfoundation.org/tx/${txHash}`} target="_blank" className="underline text-sm">
              View on Explorer
            </a>
          </div>
        )}
      </form>
    </div>
  )
}

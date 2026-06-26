'use client'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { ritualChain } from '@/lib/ritual-chain'

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected) return <>{children}</>
  if (chainId === ritualChain.id) return <>{children}</>

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">⛓️</div>
        <h2>Wrong Network</h2>
        <p>You need to be on <strong>Ritual Chain</strong> to use this app.</p>
        <button
          className="btn-primary"
          onClick={() => switchChain({ chainId: ritualChain.id })}
          disabled={isPending}
        >
          {isPending ? 'Switching...' : 'Switch to Ritual Chain'}
        </button>
        <p className="modal-hint">
          If Ritual Chain is not in your wallet, it will be added automatically.
        </p>
      </div>
    </div>
  )
}

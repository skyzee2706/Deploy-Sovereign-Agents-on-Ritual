'use client'
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ritualChain } from '@/lib/ritual-chain'

const config = getDefaultConfig({
  appName: 'Ritual Sovereign Agent Deployer',
  projectId: 'c5b1b9491f85e24a8ab74f5f8d2b22d3', // From user
  chains: [ritualChain],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#7c3aed' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

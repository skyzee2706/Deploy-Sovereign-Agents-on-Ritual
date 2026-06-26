import Link from 'next/link';

export default function Home() {
  return (
    <div className="hero">
      <h1>Sovereign Agent Deployer</h1>
      <p>
        Deploy your Ritual Sovereign Agent seamlessly without command line tools.
        Fully decentralized, secure, and client-side.
      </p>
      
      <div className="flex gap-4 justify-center">
        <Link href="/deploy" className="btn-primary" style={{ maxWidth: '200px', display: 'inline-block', textDecoration: 'none' }}>
          Deploy Agent
        </Link>
        <Link href="/topup" className="btn-primary" style={{ maxWidth: '200px', display: 'inline-block', textDecoration: 'none', backgroundColor: 'transparent', border: '1px solid var(--primary-color)' }}>
          Top Up Harness
        </Link>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Client-Side Security</h3>
          <p className="mt-2 text-gray-400">
            No private keys. Transactions are signed directly by your wallet using RainbowKit and wagmi.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>One-Click Deploy</h3>
          <p className="mt-2 text-gray-400">
            Automatically handles factory deployment, harness prediction, and configuration in a simple wizard.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⛽</div>
          <h3>Easy Top-Ups</h3>
          <p className="mt-2 text-gray-400">
            Check estimated heartbeats remaining and easily fund your agent's RitualWallet in one click.
          </p>
        </div>
      </div>
    </div>
  );
}

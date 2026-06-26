import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ritual Sovereign Agent Deployer",
  description: "Deploy and manage sovereign agents on Ritual Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <NetworkGuard>
            <nav className="navbar">
              <div className="navbar-container">
                <Link href="/" className="logo">
                  <span className="logo-icon">⛓️</span>
                  Ritual Deployer
                </Link>
                <div className="nav-links">
                  <Link href="/deploy" className="nav-link">Deploy Agent</Link>
                  <Link href="/topup" className="nav-link">Top Up</Link>
                  <ConnectButton />
                </div>
              </div>
            </nav>
            <main className="main-content">
              {children}
            </main>
          </NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}

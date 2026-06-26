import { TopupForm } from '@/components/TopupForm'

export default function TopupPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Manage Harness Balance</h1>
        <p className="text-gray-400">
          Fund your Ritual Sovereign Agent so it can keep paying for heartbeats.
        </p>
      </div>
      
      <TopupForm />
    </div>
  )
}

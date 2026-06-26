import { DeployWizard } from '@/components/DeployWizard'

export default function DeployPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Deploy Sovereign Agent</h1>
        <p className="text-gray-400">
          Configure and deploy your autonomous AI agent to Ritual Chain in one click.
        </p>
      </div>
      
      <DeployWizard />
    </div>
  )
}

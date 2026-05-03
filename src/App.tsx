import { useState } from 'react'
import type { CampaignResponse, GenerateRequest } from './lib/types'
import { generateCampaign } from './lib/api'
import { ListingForm } from './components/ListingForm'
import { CampaignOutput } from './components/CampaignOutput'
import { LandingHero } from './components/LandingHero'

type AppState = 'form' | 'loading' | 'results' | 'error'

function App() {
  const [appState, setAppState] = useState<AppState>('form')
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [pendingRequest, setPendingRequest] = useState<GenerateRequest | null>(null)

  async function handleSubmit(data: GenerateRequest) {
    setPendingRequest(data)
    setAppState('loading')
    try {
      const result = await generateCampaign(data)
      setCampaign(result)
      setAppState('results')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
      setAppState('error')
    }
  }

  async function handleRetry() {
    if (pendingRequest) {
      await handleSubmit(pendingRequest)
    } else {
      setAppState('form')
    }
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-medium">Generating your campaign...</p>
          <p className="text-sm text-slate-400 mt-1">This usually takes 1–2 minutes.</p>
        </div>
      </div>
    )
  }

  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-slate-800 font-medium mb-2">Something went wrong</p>
          <p className="text-sm text-slate-500 mb-6">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => { void handleRetry() }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => setAppState('form')}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (appState === 'results' && campaign !== null) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CampaignOutput campaign={campaign} onReset={() => setAppState('form')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHero />
      <ListingForm onSubmit={handleSubmit} />
    </div>
  )
}

export default App

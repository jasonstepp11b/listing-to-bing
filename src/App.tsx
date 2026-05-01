import { useState } from 'react';
import ListingForm from './components/ListingForm';
import { generateCampaign, ApiError } from './lib/api';
import type { CampaignResponse, GenerateCampaignInput } from './lib/types';

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; previousInput: GenerateCampaignInput }
  | { status: 'success'; data: CampaignResponse };

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const [lastInput, setLastInput] = useState<GenerateCampaignInput | null>(null);

  async function handleSubmit(input: GenerateCampaignInput) {
    setLastInput(input);
    setState({ status: 'loading' });
    try {
      const data = await generateCampaign(input);
      setState({ status: 'success', data });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.';
      setState({ status: 'error', message, previousInput: input });
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-gray-900">Generating your campaign…</p>
          <p className="mt-2 text-gray-500">This usually takes 15–30 seconds.</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</p>
          <p className="text-gray-600 mb-6">{state.message}</p>
          <button
            onClick={() => setState({ status: 'idle' })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-lg font-semibold text-gray-900">Campaign generated</p>
            <button
              onClick={() => {
                setState({ status: 'idle' });
                setLastInput(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Start over
            </button>
          </div>
          <pre className="bg-white border border-gray-200 rounded-xl p-6 text-xs text-gray-800 overflow-auto">
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Turn a listing into a Bing Ads campaign
          </h1>
          <p className="mt-2 text-gray-500">
            Paste your listing details below and get a ready-to-run ad campaign in under a minute.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <ListingForm onSubmit={handleSubmit} initialValues={lastInput ?? undefined} />
        </div>
      </div>
    </div>
  );
}

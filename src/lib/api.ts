import type { CampaignResponse, GenerateRequest } from './types'

export async function generateCampaign(data: GenerateRequest): Promise<CampaignResponse> {
  const apiUrl = import.meta.env.VITE_API_URL
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.json() as { error?: unknown }
      if (typeof data.error === 'string') message = data.error
    } catch {
      const text = await response.text().catch(() => '')
      if (text) message = text
    }
    throw new Error(message)
  }
  // Safe cast: edge function validates schema with Zod before returning
  return response.json() as Promise<CampaignResponse>
}

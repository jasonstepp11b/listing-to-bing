import type { CampaignResponse, GenerateRequest } from './types'

export async function generateCampaign(data: GenerateRequest): Promise<CampaignResponse> {
  const apiUrl = import.meta.env.VITE_API_URL
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Request failed (${response.status})`)
  }
  // Safe cast: edge function validates schema with Zod before returning
  return response.json() as Promise<CampaignResponse>
}

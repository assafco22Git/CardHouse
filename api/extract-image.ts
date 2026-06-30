import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageBase64, mediaType } = req.body as { imageBase64: string; mediaType: string }
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const prompt = `You are extracting listing data from a screenshot of a real estate or marketplace listing.

Extract and return ONLY a JSON object with these fields (use null for missing fields):
{
  "title": "short descriptive title of the listing",
  "description": "brief description of the property/item",
  "budget": <number in NIS/ILS, or null>,
  "location": "city name in English, or null",
  "image_url": null
}

Rules:
- title: 1 line, include key details (e.g. "4-room apartment in Ramat Gan")
- description: 1-2 sentences with key details like size, floor, features
- budget: numbers only, no currency symbols, monthly rent if it's a rental
- location: city only (e.g. "Tel Aviv", "Jerusalem"), not full address

Return ONLY the JSON object, no explanation.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: `Claude API error: ${err}` })
    }

    const data = await response.json() as { content: { type: string; text: string }[] }
    const text = data.content[0]?.text ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse response' })

    const extracted = JSON.parse(jsonMatch[0])
    return res.status(200).json(extracted)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}

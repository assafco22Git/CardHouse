import type { VercelRequest, VercelResponse } from '@vercel/node'

function getMeta(html: string, property: string): string {
  const match =
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
  return match?.[1]?.trim() || ''
}

function getJsonLd(html: string): Record<string, unknown> {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!match) return {}
  try { return JSON.parse(match[1]) } catch { return {} }
}

function extractPrice(html: string): number | null {
  // JSON-LD price
  const ld = getJsonLd(html)
  const ldPrice = (ld as { offers?: { price?: number } })?.offers?.price
  if (ldPrice) return Number(ldPrice)

  // Look for ₪ or ILS price patterns in text
  const priceMatch = html.match(/₪\s*([\d,]+)|(\d[\d,]+)\s*₪|([\d,]+)\s*ש"ח/)
  if (priceMatch) {
    const raw = (priceMatch[1] || priceMatch[2] || priceMatch[3]).replace(/,/g, '')
    return parseInt(raw) || null
  }
  return null
}

function extractLocation(html: string, url: string): string {
  const ld = getJsonLd(html) as { address?: { addressLocality?: string } }
  if (ld?.address?.addressLocality) return ld.address.addressLocality

  const cities = ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'אילת', 'נתניה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'רמת גן',
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Eilat', 'Netanya']
  const combined = getMeta(html, 'og:title') + ' ' + getMeta(html, 'og:description')
  for (const city of cities) {
    if (combined.includes(city)) return city
  }

  // Yad2 puts city in URL sometimes
  if (url.includes('yad2')) {
    const m = url.match(/\/([a-z-]+)\/[a-z-]+-for-(rent|sale)/)
    if (m) return m[1].replace(/-/g, ' ')
  }
  return ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { url } = req.query
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) return res.status(400).json({ error: `Failed to fetch: ${response.status}` })

    const html = await response.text()

    const title = getMeta(html, 'og:title') || getMeta(html, 'twitter:title') ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || ''
    const description = getMeta(html, 'og:description') || getMeta(html, 'description') || ''
    const image_url = getMeta(html, 'og:image') || getMeta(html, 'twitter:image') || ''
    const budget = extractPrice(html)
    const location = extractLocation(html, url)

    return res.status(200).json({ title, description, image_url, budget, location })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}

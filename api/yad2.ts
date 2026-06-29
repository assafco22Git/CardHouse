import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Yad2 city IDs
const CITY_IDS: Record<string, number> = {
  'Tel Aviv': 5000,
  'Jerusalem': 3000,
  'Haifa': 4000,
  'Beer Sheva': 9000,
  'Eilat': 8600,
  'Netanya': 7900,
  'Rishon LeZion': 8300,
  'Petah Tikva': 7700,
  'Ashdod': 7000,
  'Ramat Gan': 8100,
}

function extractListings(html: string): unknown[] {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return []
  try {
    const json = JSON.parse(match[1])
    // Navigate the dehydrated state to find listings
    const queries = json?.props?.pageProps?.dehydratedState?.queries ?? []
    for (const q of queries) {
      const data = q?.state?.data
      if (data?.feed?.feed_items) return data.feed.feed_items
      if (data?.items) return data.items
      if (Array.isArray(data)) return data
    }
    // Try alternate path
    const pageProps = json?.props?.pageProps
    if (pageProps?.feed?.feed_items) return pageProps.feed.feed_items
    return []
  } catch {
    return []
  }
}

function mapToCard(item: Record<string, unknown>, city: string) {
  const row_1 = item.row_1 as string | undefined
  const row_2 = item.row_2 as string | undefined
  const row_3 = item.row_3 as string | undefined
  const row_4 = item.row_4 as string | undefined
  const price = item.price as number | undefined
  const id = item.id ?? item.token ?? item.link_token

  const images = (item.images as { src?: string; url?: string }[] | undefined) ?? []
  const image_url = images[0]?.src ?? images[0]?.url ?? (item.cover_image as string | undefined) ?? null

  const title = [row_1, row_2].filter(Boolean).join(' · ') || 'Listing'
  const description = [row_3, row_4].filter(Boolean).join(' | ') || ''
  const source_url = id ? `https://www.yad2.co.il/item/${id}` : null

  return {
    title,
    description,
    image_url,
    budget: typeof price === 'number' ? price : null,
    location: city,
    source_url,
    tags: null,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const city = (req.query.city as string) || 'Tel Aviv'
  const minPrice = parseInt(req.query.minPrice as string) || 0
  const maxPrice = parseInt(req.query.maxPrice as string) || 20000
  const cityId = CITY_IDS[city] ?? 5000

  const url = `https://www.yad2.co.il/realestate/rent?city=${cityId}&priceOnly=1&price=${minPrice}-${maxPrice}&propertyGroup=apartments`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.yad2.co.il/',
      },
    })

    if (!response.ok) {
      return res.status(400).json({ error: `Yad2 returned ${response.status}` })
    }

    const html = await response.text()

    if (html.includes('Are you for real') || html.includes('robot') || html.includes('captcha')) {
      return res.status(429).json({ error: 'Yad2 blocked the request (captcha). Try again later.' })
    }

    const items = extractListings(html) as Record<string, unknown>[]

    if (items.length === 0) {
      return res.status(200).json({ message: 'No listings found or structure changed', saved: 0 })
    }

    const cards = items
      .filter(item => item.id || item.token || item.link_token)
      .map(item => mapToCard(item, city))
      .filter(c => c.source_url)

    // Upsert — skip duplicates by source_url
    const { data, error } = await supabase
      .from('cards')
      .upsert(cards, { onConflict: 'source_url', ignoreDuplicates: true })
      .select('id')

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ saved: data?.length ?? 0, total: cards.length })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}

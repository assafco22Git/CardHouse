const SUPABASE_URL = 'https://wngxfcldeotfryhuzdhk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XPIJoIsX9c8thYScjABrCA_28GWsvNg'

function getText(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el?.innerText?.trim()) return el.innerText.trim()
  }
  return ''
}

function getAttr(selectors, attr) {
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el?.getAttribute(attr)) return el.getAttribute(attr)
  }
  return ''
}

function extractPrice(text) {
  const m = text.match(/([\d,]+)\s*[₪$]|[₪$]\s*([\d,]+)|([\d,]+)\s*ש"ח/)
  if (m) return parseInt((m[1] || m[2] || m[3]).replace(/,/g, ''))
  return null
}

function extractYad2() {
  const title = getText(['h1', '[class*="title"]', '[data-testid="ad-title"]'])
  const description = getText(['[class*="description"]', '[data-testid="description"]', '[class*="details"]'])
  const priceText = getText(['[class*="price"]', '[data-testid*="price"]'])
  const budget = extractPrice(priceText)
  const image_url = getAttr(['[class*="gallery"] img', '[class*="main-image"] img', 'img[class*="photo"]'], 'src')
  const location = getText(['[class*="city"]', '[class*="location"]', '[data-testid*="location"]'])
  return { title, description, budget, image_url, location }
}

function extractMadlan() {
  const title = getText(['h1', '[class*="title"]'])
  const description = getText(['[class*="description"]', '[class*="about"]'])
  const priceText = getText(['[class*="price"]', '[class*="cost"]'])
  const budget = extractPrice(priceText)
  const image_url = getAttr(['img[class*="photo"]', 'img[class*="image"]', '[class*="gallery"] img'], 'src')
  const location = getText(['[class*="location"]', '[class*="address"]', '[class*="city"]'])
  return { title, description, budget, image_url, location }
}

function extractFacebook() {
  const title = getText(['h1', '[data-testid="marketplace-pdp-title"]'])
  const description = getText(['[data-testid="marketplace-pdp-description"]', '[class*="description"]'])
  const priceText = getText(['[data-testid*="price"]', '[class*="price"]'])
  const budget = extractPrice(priceText)
  const image_url = getAttr(['img[data-visualcompletion="media-vc-image"]', 'img[class*="scaledImageFitWidth"]'], 'src')
  return { title, description, budget, image_url, location: '' }
}

function extract() {
  const url = window.location.href
  if (url.includes('yad2.co.il')) return extractYad2()
  if (url.includes('madlan.co.il')) return extractMadlan()
  if (url.includes('facebook.com')) return extractFacebook()
  // Generic fallback using OG meta tags
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title
  const description = document.querySelector('meta[property="og:description"]')?.content || ''
  const image_url = document.querySelector('meta[property="og:image"]')?.content || ''
  return { title, description, budget: null, image_url, location: '' }
}

async function saveToCardHouse(data, userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cards`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${userId}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ ...data, source_url: window.location.href, user_id: userId }),
  })
  return res.ok
}

function injectButton() {
  if (document.getElementById('cardhouse-btn')) return

  const btn = document.createElement('button')
  btn.id = 'cardhouse-btn'
  btn.innerHTML = '🃏 Save to CardHouse'
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: #2c1f0e;
    color: #f5f0e6;
    border: none;
    padding: 12px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: system-ui, sans-serif;
  `

  btn.addEventListener('mouseenter', () => btn.style.background = '#c4952a')
  btn.addEventListener('mouseleave', () => btn.style.background = '#2c1f0e')

  btn.addEventListener('click', async () => {
    btn.innerHTML = '⏳ Saving...'
    btn.disabled = true

    let userId = localStorage.getItem('cardhouse_ext_user_id')
    if (!userId) {
      userId = prompt('Paste your CardHouse User ID (find it in CardHouse → + Add):')
      if (!userId) {
        btn.innerHTML = '🃏 Save to CardHouse'
        btn.disabled = false
        return
      }
      localStorage.setItem('cardhouse_ext_user_id', userId)
    }

    const data = extract()
    if (!data?.title) {
      btn.innerHTML = '❌ Could not read page'
      setTimeout(() => { btn.innerHTML = '🃏 Save to CardHouse'; btn.disabled = false }, 2500)
      return
    }

    const ok = await saveToCardHouse(data, userId)
    btn.innerHTML = ok ? '✓ Saved!' : '❌ Error — try again'
    setTimeout(() => { btn.innerHTML = '🃏 Save to CardHouse'; btn.disabled = false }, 2500)
  })

  document.body.appendChild(btn)
}

// Wait for page to load fully before injecting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButton)
} else {
  injectButton()
}

const SUPABASE_URL = 'https://wngxfcldeotfryhuzdhk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XPIJoIsX9c8thYScjABrCA_28GWsvNg'

function extractYad2() {
  const title = document.querySelector('h1')?.innerText?.trim() || document.title
  const description = document.querySelector('[class*="description"]')?.innerText?.trim()
    || document.querySelector('[data-testid="description"]')?.innerText?.trim() || ''
  const priceText = document.querySelector('[class*="price"]')?.innerText?.trim() || ''
  const budget = parseInt(priceText.replace(/[^\d]/g, '')) || null
  const image = document.querySelector('[class*="gallery"] img, [class*="image"] img')?.src || null
  const city = document.querySelector('[class*="city"], [class*="location"]')?.innerText?.trim() || null
  return { title, description, budget, image_url: image, location: city }
}

function extractMadlan() {
  const title = document.querySelector('h1')?.innerText?.trim() || document.title
  const description = document.querySelector('[class*="description"], [class*="details"]')?.innerText?.trim() || ''
  const priceText = document.querySelector('[class*="price"]')?.innerText?.trim() || ''
  const budget = parseInt(priceText.replace(/[^\d]/g, '')) || null
  const image = document.querySelector('img[class*="photo"], img[class*="image"]')?.src || null
  const city = document.querySelector('[class*="location"], [class*="address"]')?.innerText?.trim() || null
  return { title, description, budget, image_url: image, location: city }
}

function extractFacebook() {
  const title = document.querySelector('h1')?.innerText?.trim() || document.title
  const description = document.querySelector('[data-testid="marketplace-pdp-description"]')?.innerText?.trim() || ''
  const priceText = document.querySelector('[class*="price"], [data-testid*="price"]')?.innerText?.trim() || ''
  const budget = parseInt(priceText.replace(/[^\d]/g, '')) || null
  const image = document.querySelector('img[data-visualcompletion="media-vc-image"]')?.src || null
  return { title, description, budget, image_url: image, location: null }
}

function extract() {
  const url = window.location.href
  if (url.includes('yad2.co.il')) return extractYad2()
  if (url.includes('madlan.co.il')) return extractMadlan()
  if (url.includes('facebook.com')) return extractFacebook()
  return null
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
    transition: background 0.2s;
  `

  btn.addEventListener('mouseenter', () => btn.style.background = '#c4952a')
  btn.addEventListener('mouseleave', () => btn.style.background = '#2c1f0e')

  btn.addEventListener('click', async () => {
    btn.innerHTML = '⏳ Saving...'
    btn.disabled = true

    const data = extract()
    if (!data) {
      btn.innerHTML = '❌ Could not extract data'
      setTimeout(() => { btn.innerHTML = '🃏 Save to CardHouse'; btn.disabled = false }, 2000)
      return
    }

    // Prompt user for their CardHouse user ID (one-time setup)
    let userId = localStorage.getItem('cardhouse_ext_user_id')
    if (!userId) {
      userId = prompt('Paste your CardHouse User ID (found in CardHouse → Profile):')
      if (!userId) {
        btn.innerHTML = '❌ Cancelled'
        setTimeout(() => { btn.innerHTML = '🃏 Save to CardHouse'; btn.disabled = false }, 2000)
        return
      }
      localStorage.setItem('cardhouse_ext_user_id', userId)
    }

    const ok = await saveToCardHouse(data, userId)
    btn.innerHTML = ok ? '✓ Saved!' : '❌ Error — check User ID'
    setTimeout(() => { btn.innerHTML = '🃏 Save to CardHouse'; btn.disabled = false }, 2000)
  })

  document.body.appendChild(btn)
}

injectButton()

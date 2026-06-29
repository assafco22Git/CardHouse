chrome.storage.local.get(['cardhouse_user_id'], ({ cardhouse_user_id }) => {
  const el = document.getElementById('status')
  if (cardhouse_user_id) {
    el.innerHTML = '✓ Logged in'
    el.className = 'status logged-in'
  } else {
    el.innerHTML = '✗ Not logged in — open <a href="https://card-house-seven.vercel.app" target="_blank">CardHouse</a> first'
    el.className = 'status logged-out'
  }
})

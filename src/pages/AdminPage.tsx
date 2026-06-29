import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User
  onBack: () => void
}

type Status = 'idle' | 'fetching' | 'saving' | 'success' | 'error'

const CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Eilat']

export function AdminPage({ user, onBack }: Props) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [syncCity, setSyncCity] = useState('Tel Aviv')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult('')
    try {
      const res = await fetch(`/api/yad2?city=${encodeURIComponent(syncCity)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSyncResult(`✓ ${data.saved} new listings saved (${data.total} found)`)
    } catch (e) {
      setSyncResult(`❌ ${e instanceof Error ? e.message : 'Failed'}`)
    }
    setSyncing(false)
  }

  const handleSave = async () => {
    if (!url.trim()) return
    setStatus('fetching')
    setMessage('')

    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not extract listing')

      setStatus('saving')
      const { error: err } = await supabase.from('cards').insert({
        title: data.title || url,
        description: data.description || '',
        image_url: data.image_url || null,
        location: data.location || null,
        budget: data.budget || null,
        source_url: url.trim(),
        user_id: user.id,
      })

      if (err) throw new Error(err.message)
      setStatus('success')
      setMessage(data.title || 'Listing saved')
      setUrl('')
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#f5f0e6' }}>
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e0d8c8' }}>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 36 }}>🃏</span>
          <span className="font-black tracking-tight" style={{ fontSize: 28, color: '#2c1f0e' }}>Add Listing</span>
        </div>
        <button onClick={onBack} style={{ color: '#8a7a60', fontSize: 14 }}>← Back</button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ gap: 32 }}>

        {/* Auto-sync from Yad2 */}
        <div style={{ width: '100%', maxWidth: 480, background: '#fffdf8', border: '1px solid #d4c9b0', borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2c1f0e', margin: '0 0 4px' }}>🔄 Auto-sync from Yad2</p>
          <p style={{ fontSize: 12, color: '#8a7a60', margin: '0 0 14px' }}>Pulls latest rentals automatically every hour</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={syncCity}
              onChange={e => setSyncCity(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #d4c9b0', background: '#f5f0e6', color: '#2c1f0e', fontSize: 14 }}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: syncing ? '#d4c9b0' : '#c4952a', color: '#fffdf8', fontSize: 14, fontWeight: 600, cursor: syncing ? 'not-allowed' : 'pointer' }}
            >
              {syncing ? '⏳' : 'Sync now'}
            </button>
          </div>
          {syncResult && <p style={{ fontSize: 12, marginTop: 10, color: syncResult.startsWith('✓') ? '#2d6a2d' : '#c0392b' }}>{syncResult}</p>}
        </div>

        <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e0d8c8' }} />
          <span style={{ fontSize: 12, color: '#8a7a60' }}>or paste a link manually</span>
          <div style={{ flex: 1, height: 1, background: '#e0d8c8' }} />
        </div>

        <p style={{ fontSize: 15, color: '#8a7a60', textAlign: 'center', margin: '-16px 0 0' }}>
          Paste a Yad2 or Madlan link — we'll do the rest
        </p>

        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              border: '1.5px solid #d4c9b0',
              background: '#fffdf8',
              color: '#2c1f0e',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="https://www.yad2.co.il/item/..."
            value={url}
            onChange={e => { setUrl(e.target.value); setStatus('idle'); setMessage('') }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />

          <button
            onClick={handleSave}
            disabled={!url.trim() || status === 'fetching' || status === 'saving'}
            style={{
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              background: !url.trim() || status === 'fetching' || status === 'saving' ? '#d4c9b0' : '#2c1f0e',
              color: '#f5f0e6',
              fontSize: 16,
              fontWeight: 700,
              cursor: !url.trim() || status === 'fetching' || status === 'saving' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'fetching' ? '⏳ Extracting...' : status === 'saving' ? '💾 Saving...' : 'Save to CardHouse'}
          </button>
        </div>

        {status === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22 }}>✓</p>
            <p style={{ fontSize: 14, color: '#2d6a2d', fontWeight: 600 }}>{message}</p>
            <p style={{ fontSize: 13, color: '#8a7a60', marginTop: 4 }}>Paste another link to add more</p>
          </div>
        )}

        {status === 'error' && (
          <p style={{ fontSize: 13, color: '#c0392b', textAlign: 'center', maxWidth: 360 }}>❌ {message}</p>
        )}
      </div>
    </div>
  )
}

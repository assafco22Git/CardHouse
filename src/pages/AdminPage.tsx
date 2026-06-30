import { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User
  onBack: () => void
}

type Status = 'idle' | 'reading' | 'saving' | 'success' | 'error'

export function AdminPage({ user, onBack }: Props) {
  // Screenshot flow
  const [imgStatus, setImgStatus] = useState<Status>('idle')
  const [imgMessage, setImgMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // URL paste flow
  const [url, setUrl] = useState('')
  const [urlStatus, setUrlStatus] = useState<Status>('idle')
  const [urlMessage, setUrlMessage] = useState('')

  const handleImageUpload = async (file: File) => {
    setImgStatus('reading')
    setImgMessage('')
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/extract-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setImgStatus('saving')
      const { error: err } = await supabase.from('cards').insert({
        title: data.title || 'Untitled listing',
        description: data.description || '',
        image_url: data.image_url || null,
        location: data.location || null,
        budget: data.budget || null,
        source_url: null,
        user_id: user.id,
      })
      if (err) throw new Error(err.message)

      setImgStatus('success')
      setImgMessage(data.title || 'Listing saved')
    } catch (e) {
      setImgStatus('error')
      setImgMessage(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const handleUrlSave = async () => {
    if (!url.trim()) return
    setUrlStatus('reading')
    setUrlMessage('')
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not extract listing')

      setUrlStatus('saving')
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
      setUrlStatus('success')
      setUrlMessage(data.title || 'Listing saved')
      setUrl('')
    } catch (e) {
      setUrlStatus('error')
      setUrlMessage(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const busy = imgStatus === 'reading' || imgStatus === 'saving'

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f5f0e6', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e0d8c8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🃏</span>
          <span style={{ fontWeight: 900, fontSize: 20, color: '#2c1f0e' }}>Add Listing</span>
        </div>
        <button onClick={onBack} style={{ color: '#8a7a60', fontSize: 14 }}>← Back</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', gap: 16 }}>

        {/* Screenshot upload — primary method */}
        <div style={{ width: '100%', maxWidth: 480 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#2c1f0e', marginBottom: 8 }}>📸 Screenshot a listing</p>
          <p style={{ fontSize: 12, color: '#8a7a60', marginBottom: 12, lineHeight: 1.5 }}>
            Take a screenshot of any listing — Yad2, Facebook, WhatsApp, anything. Claude reads it and saves the details automatically.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
          />

          <button
            onClick={() => { if (!busy) { setImgStatus('idle'); setImgMessage(''); fileRef.current?.click() } }}
            disabled={busy}
            style={{
              width: '100%', padding: '18px 0', borderRadius: 14, border: '2px dashed',
              borderColor: busy ? '#d4c9b0' : '#c4952a',
              background: busy ? '#f5f0e6' : '#fffdf8',
              color: busy ? '#8a7a60' : '#2c1f0e',
              fontSize: 15, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {busy ? (imgStatus === 'reading' ? '🔍 Reading image...' : '💾 Saving...') : '📷 Upload screenshot or photo'}
          </button>

          {imgStatus === 'success' && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#e8f4e8', border: '1px solid #a8d5a8' }}>
              <p style={{ fontSize: 13, color: '#2d6a2d', fontWeight: 600 }}>✓ Saved: {imgMessage}</p>
              <p style={{ fontSize: 12, color: '#4a8a4a', marginTop: 2 }}>Upload another to add more</p>
            </div>
          )}
          {imgStatus === 'error' && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#c0392b' }}>❌ {imgMessage}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e0d8c8' }} />
          <span style={{ fontSize: 12, color: '#8a7a60' }}>or paste a link</span>
          <div style={{ flex: 1, height: 1, background: '#e0d8c8' }} />
        </div>

        {/* URL paste */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #d4c9b0', background: '#fffdf8', color: '#2c1f0e', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            placeholder="https://www.yad2.co.il/item/..."
            value={url}
            onChange={e => { setUrl(e.target.value); setUrlStatus('idle'); setUrlMessage('') }}
            onKeyDown={e => e.key === 'Enter' && handleUrlSave()}
          />
          <button
            onClick={handleUrlSave}
            disabled={!url.trim() || urlStatus === 'reading' || urlStatus === 'saving'}
            style={{
              padding: '12px 0', borderRadius: 12, border: 'none',
              background: !url.trim() || urlStatus === 'reading' || urlStatus === 'saving' ? '#d4c9b0' : '#2c1f0e',
              color: '#f5f0e6', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {urlStatus === 'reading' ? '⏳ Extracting...' : urlStatus === 'saving' ? '💾 Saving...' : 'Save link'}
          </button>
          {urlStatus === 'success' && <p style={{ fontSize: 12, color: '#2d6a2d', fontWeight: 600 }}>✓ {urlMessage}</p>}
          {urlStatus === 'error' && <p style={{ fontSize: 12, color: '#c0392b' }}>❌ {urlMessage}</p>}
        </div>
      </div>
    </div>
  )
}

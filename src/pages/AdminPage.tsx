import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User
  onBack: () => void
}

const ISRAEL_CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Eilat', 'Netanya', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Ramat Gan']

const emptyForm = { title: '', description: '', image_url: '', location: '', budget: '', tags: '', source_url: '' }

export function AdminPage({ user, onBack }: Props) {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setSuccess(false)
  }

  const handleFetch = async () => {
    if (!url.trim()) return
    setFetching(true)
    setFetchError('')
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setForm({
        title: data.title || '',
        description: data.description || '',
        image_url: data.image_url || '',
        location: data.location || '',
        budget: data.budget ? String(data.budget) : '',
        tags: '',
        source_url: url.trim(),
      })
    } catch (e) {
      setFetchError('Could not extract listing. Fill in the details manually below.')
      setForm(f => ({ ...f, source_url: url.trim() }))
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('cards').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      location: form.location || null,
      budget: form.budget ? parseInt(form.budget) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      source_url: form.source_url.trim() || null,
      user_id: user.id,
    })
    setSaving(false)
    if (err) return setError(err.message)
    setSuccess(true)
    setUrl('')
    setForm(emptyForm)
  }

  const hasForm = form.title || form.description

  return (
    <div className="min-h-dvh" style={{ background: '#f5f0e6' }}>
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e0d8c8' }}>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 36 }}>🃏</span>
          <span className="font-black tracking-tight" style={{ fontSize: 28, color: '#2c1f0e' }}>Add Listing</span>
        </div>
        <button onClick={onBack} style={{ color: '#8a7a60', fontSize: 14 }}>← Back</button>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* URL input */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Paste a listing URL</label>
          <p style={{ fontSize: 12, color: '#8a7a60', marginBottom: 10 }}>Works with Yad2, Madlan, and most listing sites</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="https://www.yad2.co.il/item/..."
              value={url}
              onChange={e => { setUrl(e.target.value); setFetchError('') }}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={fetching || !url.trim()}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: fetching || !url.trim() ? '#d4c9b0' : '#2c1f0e',
                color: '#f5f0e6',
                fontSize: 14,
                fontWeight: 600,
                cursor: fetching || !url.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {fetching ? '⏳ Loading...' : '→ Extract'}
            </button>
          </div>
          {fetchError && <p style={{ fontSize: 12, color: '#c4952a', marginTop: 6 }}>⚠ {fetchError}</p>}
        </div>

        {/* Auto-filled form */}
        {(hasForm || fetchError) && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 1, background: '#e0d8c8', margin: '0 0 4px' }} />

            {form.image_url && (
              <img src={form.image_url} alt="preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid #d4c9b0' }} />
            )}

            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Listing title" />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Location</label>
                <select style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select city</option>
                  {ISRAEL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget (₪)</label>
                <input style={inputStyle} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="5000" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Image URL</label>
              <input style={inputStyle} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input style={inputStyle} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="balcony, parking, renovated" />
            </div>

            {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}
            {success && <p style={{ color: '#2d6a2d', fontSize: 13 }}>✓ Listing added!</p>}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 0',
                borderRadius: 12,
                border: 'none',
                background: saving ? '#d4c9b0' : '#2c1f0e',
                color: '#f5f0e6',
                fontSize: 15,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Add to CardHouse'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#5a4a2a', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d4c9b0', background: '#fffdf8', color: '#2c1f0e', fontSize: 14, outline: 'none', boxSizing: 'border-box' }

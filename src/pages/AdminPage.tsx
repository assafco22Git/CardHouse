import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User
  onBack: () => void
}

const ISRAEL_CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Eilat', 'Netanya', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Ramat Gan']

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  location: '',
  budget: '',
  tags: '',
  source_url: '',
}

export function AdminPage({ user, onBack }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setSuccess(false)
    setError('')
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
    setForm(emptyForm)
  }

  return (
    <div className="min-h-dvh" style={{ background: '#f5f0e6' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #e0d8c8', background: '#f5f0e6' }}>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 36 }}>🃏</span>
          <span className="font-black tracking-tight" style={{ fontSize: 28, color: '#2c1f0e' }}>Add Card</span>
        </div>
        <button onClick={onBack} style={{ color: '#8a7a60', fontSize: 14 }}>← Back</button>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Extension setup */}
        <div style={{ background: '#fffdf8', border: '1px solid #d4c9b0', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#5a4a2a', margin: '0 0 6px' }}>🧩 Chrome Extension Setup</p>
          <p style={{ fontSize: 12, color: '#8a7a60', margin: '0 0 10px' }}>Your User ID — paste this into the extension when prompted:</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{ fontSize: 11, background: '#f0e8d4', padding: '6px 10px', borderRadius: 8, flex: 1, wordBreak: 'break-all', color: '#2c1f0e' }}>{user.id}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(user.id)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d4c9b0', background: '#f0e8d4', color: '#5a4a2a', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >Copy</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Source URL */}
          <div>
            <label style={labelStyle}>Listing URL (Yad2 / Madlan / Facebook)</label>
            <input
              style={inputStyle}
              placeholder="https://www.yad2.co.il/item/..."
              value={form.source_url}
              onChange={e => set('source_url', e.target.value)}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle}
              placeholder="e.g. 3BR apartment in Tel Aviv"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              placeholder="Describe the listing..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Location + Budget row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Location</label>
              <select
                style={inputStyle}
                value={form.location}
                onChange={e => set('location', e.target.value)}
              >
                <option value="">Select city</option>
                {ISRAEL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Budget (₪)</label>
              <input
                style={inputStyle}
                type="number"
                placeholder="e.g. 5000"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL</label>
            <input
              style={inputStyle}
              placeholder="https://..."
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
            />
            {form.image_url && (
              <img src={form.image_url} alt="preview" style={{ marginTop: 8, width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid #d4c9b0' }} />
            )}
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              style={inputStyle}
              placeholder="balcony, parking, renovated"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}
          {success && <p style={{ color: '#2d6a2d', fontSize: 13 }}>✓ Card added successfully!</p>}

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
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#5a4a2a',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #d4c9b0',
  background: '#fffdf8',
  color: '#2c1f0e',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

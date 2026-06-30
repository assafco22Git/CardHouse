import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { useCards } from '../hooks/useCards'
import { CardStack } from '../components/CardStack'
import type { Filters } from '../types'

interface Props {
  user: User
  onSignOut: () => void
  isAdmin: boolean
  onAdmin: () => void
}

const ISRAEL_CITIES = ['All', 'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Eilat']
const BUDGET_OPTIONS = [
  { label: 'Any', value: null },
  { label: '₪500', value: 500 },
  { label: '₪1K', value: 1000 },
  { label: '₪2.5K', value: 2500 },
  { label: '₪5K', value: 5000 },
]

export function SwipePage({ user, onSignOut, isAdmin, onAdmin }: Props) {
  const [filters, setFilters] = useState<Filters>({ location: '', maxBudget: null })
  const { cards, loading, recordSwipe } = useCards(user.id, filters)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f5f0e6', overflow: 'hidden' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #e0d8c8', background: '#f5f0e6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🃏</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#2c1f0e', letterSpacing: '-0.5px' }}>CardHouse</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" referrerPolicy="no-referrer"
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #c4952a', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0e8d4', border: '2px solid #c4952a', color: '#8a6020', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
            {isAdmin && (
              <button onClick={onAdmin} style={{ color: '#c4952a', fontSize: 13, fontWeight: 600 }}>+ Add</button>
            )}
            <button onClick={onSignOut} style={{ color: '#8a7a60', fontSize: 13 }}>Out</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12 }}>📍</span>
            {ISRAEL_CITIES.map(city => {
              const active = city === 'All' ? filters.location === '' : filters.location === city
              return (
                <button key={city} onClick={() => setFilters(f => ({ ...f, location: city === 'All' ? '' : city }))}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid', cursor: 'pointer',
                    background: active ? '#2c1f0e' : '#fffdf8', color: active ? '#f5f0e6' : '#5a4a2a',
                    borderColor: active ? '#2c1f0e' : '#d4c9b0' }}>
                  {city}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12 }}>💰</span>
            {BUDGET_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => setFilters(f => ({ ...f, maxBudget: opt.value }))}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid', cursor: 'pointer',
                  background: filters.maxBudget === opt.value ? '#c4952a' : '#fffdf8',
                  color: filters.maxBudget === opt.value ? '#fffdf8' : '#5a4a2a',
                  borderColor: filters.maxBudget === opt.value ? '#c4952a' : '#d4c9b0' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main — fills remaining space */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', gap: 12, overflow: 'hidden', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                style={{ width: 8, height: 8, background: '#c4952a', borderRadius: '50%' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
            ))}
          </div>
        ) : (
          <CardStack cards={cards} onSwipe={recordSwipe} />
        )}

        {!loading && cards.length > 0 && (
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'left')}
              style={{ width: 60, height: 60, borderRadius: '50%', background: '#fce8e8', border: '2px solid #e08080', color: '#c0392b', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ✕
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'right')}
              style={{ width: 60, height: 60, borderRadius: '50%', background: '#f5ecd4', border: '2px solid #c4952a', color: '#8a6020', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ♥
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}

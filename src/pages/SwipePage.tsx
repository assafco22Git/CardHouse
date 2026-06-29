import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { useCards } from '../hooks/useCards'
import { CardStack } from '../components/CardStack'
import type { Filters } from '../types'

interface Props {
  user: User
  onSignOut: () => void
}

const ISRAEL_CITIES = ['All', 'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Eilat']
const BUDGET_OPTIONS = [
  { label: 'Any', value: null },
  { label: '₪500', value: 500 },
  { label: '₪1,000', value: 1000 },
  { label: '₪2,500', value: 2500 },
  { label: '₪5,000', value: 5000 },
]

export function SwipePage({ user, onSignOut }: Props) {
  const [filters, setFilters] = useState<Filters>({ location: '', maxBudget: null })
  const { cards, loading, recordSwipe } = useCards(user.id, filters)

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#f5f0e6' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e0d8c8', background: '#f5f0e6' }}>
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 36 }}>🃏</span>
            <span className="font-black tracking-tight" style={{ fontSize: 28, color: '#2c1f0e' }}>CardHouse</span>
          </div>
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #c4952a', flexShrink: 0 }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f0e8d4', border: '2px solid #c4952a', color: '#8a6020', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={onSignOut} style={{ color: '#8a7a60', fontSize: 14, whiteSpace: 'nowrap' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex flex-wrap gap-3">
          {/* Location */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: '#8a7a60', fontWeight: 500 }}>📍</span>
            <div className="flex gap-1 flex-wrap">
              {ISRAEL_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setFilters(f => ({ ...f, location: city === 'All' ? '' : city }))}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: (city === 'All' ? filters.location === '' : filters.location === city) ? '#2c1f0e' : '#fffdf8',
                    color: (city === 'All' ? filters.location === '' : filters.location === city) ? '#f5f0e6' : '#5a4a2a',
                    borderColor: (city === 'All' ? filters.location === '' : filters.location === city) ? '#2c1f0e' : '#d4c9b0',
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: '#8a7a60', fontWeight: 500 }}>💰</span>
            <div className="flex gap-1 flex-wrap">
              {BUDGET_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setFilters(f => ({ ...f, maxBudget: opt.value }))}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: filters.maxBudget === opt.value ? '#c4952a' : '#fffdf8',
                    color: filters.maxBudget === opt.value ? '#fffdf8' : '#5a4a2a',
                    borderColor: filters.maxBudget === opt.value ? '#c4952a' : '#d4c9b0',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ width: 8, height: 8, background: '#c4952a', borderRadius: '50%' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <CardStack cards={cards} onSwipe={recordSwipe} />
        )}

        {!loading && cards.length > 0 && (
          <div className="flex gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'left')}
              style={{ width: 56, height: 56, borderRadius: '50%', background: '#fce8e8', border: '1.5px solid #e08080', color: '#c0392b', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'right')}
              style={{ width: 56, height: 56, borderRadius: '50%', background: '#f5ecd4', border: '1.5px solid #c4952a', color: '#8a6020', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ♥
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}

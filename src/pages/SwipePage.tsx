import type { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { useCards } from '../hooks/useCards'
import { CardStack } from '../components/CardStack'

interface Props {
  user: User
  onSignOut: () => void
}

export function SwipePage({ user, onSignOut }: Props) {
  const { cards, loading, recordSwipe } = useCards(user.id)

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#f5f0e6' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-7" style={{ borderBottom: '1px solid #e0d8c8' }}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">🃏</span>
          <span className="font-black text-3xl tracking-tight" style={{ color: '#2c1f0e' }}>CardHouse</span>
        </div>
        <div className="flex items-center gap-4">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-11 h-11 rounded-full"
              style={{ border: '2px solid #c4952a' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold"
              style={{ background: '#f0e8d4', border: '2px solid #c4952a', color: '#8a6020', fontSize: 16 }}>
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <button
            onClick={onSignOut}
            className="text-sm transition-colors"
            style={{ color: '#8a7a60' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <CardStack cards={cards} onSwipe={recordSwipe} />
        )}

        {/* Action buttons */}
        {!loading && cards.length > 0 && (
          <div className="flex gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'left')}
              className="w-14 h-14 rounded-full text-2xl flex items-center justify-center"
              style={{ background: '#fce8e8', border: '1.5px solid #e08080', color: '#c0392b' }}
            >
              ✕
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'right')}
              className="w-14 h-14 rounded-full text-2xl flex items-center justify-center"
              style={{ background: '#f5ecd4', border: '1.5px solid #c4952a', color: '#8a6020' }}
            >
              ♥
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}

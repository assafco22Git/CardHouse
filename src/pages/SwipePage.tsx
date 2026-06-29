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
    <div className="flex flex-col min-h-dvh bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          <span className="font-black text-white text-lg tracking-tight">CardHouse</span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user.user_metadata?.avatar_url}
            alt="avatar"
            className="w-8 h-8 rounded-full bg-slate-700"
          />
          <button
            onClick={onSignOut}
            className="text-slate-400 text-sm hover:text-white transition-colors"
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
              className="w-14 h-14 rounded-full bg-slate-800 border border-red-500/40 text-red-400 text-2xl flex items-center justify-center shadow-lg"
            >
              ✕
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => recordSwipe(cards[0].id, 'right')}
              className="w-14 h-14 rounded-full bg-slate-800 border border-green-500/40 text-green-400 text-2xl flex items-center justify-center shadow-lg"
            >
              ♥
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}

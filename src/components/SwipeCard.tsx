import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import type { Card } from '../types'

interface Props {
  card: Card
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

const SUITS = ['♠', '♥', '♦', '♣']

export function SwipeCard({ card, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const heartOpacity = useTransform(x, [-150, -40], [1, 0])
  const passOpacity = useTransform(x, [40, 150], [0, 1])
  const heartScale = useTransform(x, [-150, -40], [1.2, 0.8])
  const [gone, setGone] = useState(false)

  const suit = SUITS[card.title.length % 4]
  const isRed = suit === '♥' || suit === '♦'

  const triggerSwipe = (direction: 'left' | 'right') => {
    setGone(true)
    setTimeout(() => onSwipe(direction), 300)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => triggerSwipe('left'),
    onSwipedRight: () => triggerSwipe('right'),
    trackMouse: true,
  })

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) triggerSwipe('right')
    else if (info.offset.x < -100) triggerSwipe('left')
    else x.set(0)
  }

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ scale: 0.95, y: 16, background: '#ede8dc', border: '1px solid #d4c9b0' }}
      />
    )
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          {...handlers}
          className="absolute inset-0 rounded-2xl cursor-grab active:cursor-grabbing select-none overflow-hidden flex flex-col"
          style={{ x, rotate, background: '#fffdf8', border: '1px solid #d4c9b0', boxShadow: '0 4px 24px rgba(44,31,14,0.10)' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {card.image_url ? (
            <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ background: '#f5f0e6' }}>
              <span style={{ fontSize: 120, color: isRed ? '#c0392b' : '#2c1f0e', opacity: 0.15, lineHeight: 1 }}>
                {suit}
              </span>
            </div>
          )}

          <div className="p-5 shrink-0">
            <h2 className="text-xl font-bold mb-1" style={{ color: '#2c1f0e' }}>{card.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8a7a60' }}>{card.description}</p>
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {card.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{ background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Left swipe = hearts + pink overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 pointer-events-none"
            style={{ opacity: heartOpacity, background: 'rgba(255,182,193,0.35)', scale: heartScale }}
          >
            <span style={{ fontSize: 64 }}>💕</span>
            <span className="font-black text-2xl tracking-widest" style={{ color: '#d63384' }}>LOVE</span>
          </motion.div>

          {/* Right swipe = gray overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 pointer-events-none"
            style={{ opacity: passOpacity, background: 'rgba(180,180,180,0.35)' }}
          >
            <span style={{ fontSize: 64 }}>👋</span>
            <span className="font-black text-2xl tracking-widest" style={{ color: '#888' }}>PASS</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

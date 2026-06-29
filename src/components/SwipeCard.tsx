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
  const [gone, setGone] = useState(false)

  const suit = SUITS[card.title.length % 4]
  const isRed = suit === '♥' || suit === '♦'

  const triggerSwipe = (direction: 'left' | 'right') => {
    setGone(true)
    setTimeout(() => onSwipe(direction), 350)
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
        <>
          {/* Fullscreen overlays — rendered outside the card */}
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-50"
            style={{ opacity: heartOpacity, background: 'rgba(255,182,193,0.55)' }}
          >
            <span style={{ fontSize: 120 }}>💕</span>
            <span className="font-black tracking-widest" style={{ fontSize: 48, color: '#d63384' }}>LOVE</span>
          </motion.div>

          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-50"
            style={{ opacity: passOpacity, background: 'rgba(160,160,160,0.45)' }}
          >
            <span style={{ fontSize: 120 }}>👋</span>
            <span className="font-black tracking-widest" style={{ fontSize: 48, color: '#555' }}>PASS</span>
          </motion.div>

          {/* Card */}
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
              <div className="flex flex-wrap gap-2 mt-3">
                {card.location && (
                  <span className="px-2 py-1 text-xs rounded-full" style={{ background: '#e8f4e8', color: '#2d6a2d', border: '1px solid #a8d5a8' }}>
                    📍 {card.location}
                  </span>
                )}
                {card.budget && (
                  <span className="px-2 py-1 text-xs rounded-full" style={{ background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
                    ₪{card.budget.toLocaleString()}
                  </span>
                )}
                {card.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{ background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

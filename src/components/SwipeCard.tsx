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
  const rotate = useTransform(x, [-200, 200], [-20, 20])

  // Kick in much sooner, fully opaque quickly
  const heartOpacity = useTransform(x, [-30, -90], [0, 1])
  const passOpacity = useTransform(x, [30, 90], [0, 1])
  const heartScale = useTransform(x, [-30, -90], [0.6, 1])
  const passScale = useTransform(x, [30, 90], [0.6, 1])

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
    if (info.offset.x > 80) triggerSwipe('right')
    else if (info.offset.x < -80) triggerSwipe('left')
    else x.set(0)
  }

  if (!isTop) {
    return (
      <motion.div
        style={{ position: 'absolute', inset: 0, borderRadius: 20, scale: 0.95, y: 12, background: '#ede8dc', border: '1px solid #d4c9b0' }}
      />
    )
  }

  return (
    <AnimatePresence>
      {!gone && (
        <>
          {/* LOVE overlay — left swipe */}
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'rgba(255, 80, 160, 0.72)',
              opacity: heartOpacity, scale: heartScale,
            }}
          >
            <span style={{ fontSize: 100, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>💕</span>
            <span style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: 4, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>LOVE</span>
          </motion.div>

          {/* PASS overlay — right swipe */}
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'rgba(60, 60, 60, 0.72)',
              opacity: passOpacity, scale: passScale,
            }}
          >
            <span style={{ fontSize: 100, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>👋</span>
            <span style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: 4, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>PASS</span>
          </motion.div>

          {/* Card */}
          <motion.div
            {...handlers}
            style={{
              position: 'absolute', inset: 0, borderRadius: 20,
              cursor: 'grab', userSelect: 'none', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: '#fffdf8', border: '1px solid #d4c9b0',
              boxShadow: '0 6px 32px rgba(44,31,14,0.13)',
              x, rotate,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {card.image_url ? (
              <img src={card.image_url} alt={card.title} style={{ width: '100%', flex: 1, objectFit: 'cover', minHeight: 0 }} />
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e6', minHeight: 0 }}>
                <span style={{ fontSize: 100, color: isRed ? '#c0392b' : '#2c1f0e', opacity: 0.12, lineHeight: 1 }}>
                  {suit}
                </span>
              </div>
            )}

            <div style={{ padding: '14px 16px', flexShrink: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2c1f0e', margin: '0 0 4px' }}>{card.title}</h2>
              <p style={{ fontSize: 13, color: '#8a7a60', margin: 0, lineHeight: 1.4 }}>{card.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {card.location && (
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#e8f4e8', color: '#2d6a2d', border: '1px solid #a8d5a8' }}>
                    📍 {card.location}
                  </span>
                )}
                {card.budget && (
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
                    ₪{card.budget.toLocaleString()}
                  </span>
                )}
                {card.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
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

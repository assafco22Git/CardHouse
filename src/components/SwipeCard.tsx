import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import type { Card } from '../types'

interface Props {
  card: Card
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ card, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0])
  const [gone, setGone] = useState(false)

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
          className="absolute inset-0 rounded-2xl cursor-grab active:cursor-grabbing select-none overflow-hidden"
          style={{ x, rotate, background: '#fffdf8', border: '1px solid #d4c9b0', boxShadow: '0 4px 24px rgba(44,31,14,0.10)' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {card.image_url && (
            <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover" />
          )}

          <div className="p-6">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#2c1f0e' }}>{card.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8a7a60' }}>{card.description}</p>
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {card.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{ background: '#f0e8d4', color: '#8a6020', border: '1px solid #c8a860' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Like / Nope overlays */}
          <motion.div
            className="absolute top-6 left-6 border-4 border-green-400 text-green-400 font-black text-2xl px-3 py-1 rounded-lg rotate-[-15deg]"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-lg rotate-[15deg]"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

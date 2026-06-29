import { SwipeCard } from './SwipeCard'
import type { Card } from '../types'

interface Props {
  cards: Card[]
  onSwipe: (cardId: string, direction: 'left' | 'right') => void
}

export function CardStack({ cards, onSwipe }: Props) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: '#8a7a60' }}>
        <span className="text-6xl">🃏</span>
        <p className="text-lg">No more cards!</p>
        <p className="text-sm">Check back later for new ones.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: 460 }}>
      {cards.slice(0, 2).map((card, i) => (
        <SwipeCard
          key={card.id}
          card={card}
          isTop={i === 0}
          onSwipe={(dir) => onSwipe(card.id, dir)}
        />
      ))}
    </div>
  )
}

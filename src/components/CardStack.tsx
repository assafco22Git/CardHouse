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
    <div className="relative mx-auto" style={{ width: 360, height: 460 }}>
      {cards.slice(0, 2).reverse().map((card, i, arr) => (
        <SwipeCard
          key={card.id}
          card={card}
          isTop={i === arr.length - 1}
          onSwipe={(dir) => onSwipe(card.id, dir)}
        />
      ))}
    </div>
  )
}

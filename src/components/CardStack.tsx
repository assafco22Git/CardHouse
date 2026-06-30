import { SwipeCard } from './SwipeCard'
import type { Card } from '../types'

interface Props {
  cards: Card[]
  onSwipe: (cardId: string, direction: 'left' | 'right') => void
}

export function CardStack({ cards, onSwipe }: Props) {
  if (cards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: '#8a7a60' }}>
        <span style={{ fontSize: 48 }}>🃏</span>
        <p style={{ fontSize: 16 }}>No more cards!</p>
        <p style={{ fontSize: 13 }}>Check back later for new ones.</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400, flex: 1, minHeight: 0 }}>
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

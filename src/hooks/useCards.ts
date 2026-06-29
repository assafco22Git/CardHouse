import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Card } from '../types'

export function useCards(userId: string | undefined) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCards(data ?? [])
        setLoading(false)
      })
  }, [userId])

  const recordSwipe = async (cardId: string, direction: 'left' | 'right') => {
    if (!userId) return
    await supabase.from('swipes').insert({ card_id: cardId, direction, user_id: userId })
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  return { cards, loading, recordSwipe }
}

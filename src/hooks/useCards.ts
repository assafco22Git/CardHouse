import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Card, Filters } from '../types'

export function useCards(userId: string | undefined, filters: Filters) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)

    let query = supabase.from('cards').select('*').order('created_at', { ascending: false })

    if (filters.location) query = query.eq('location', filters.location)
    if (filters.maxBudget !== null) query = query.lte('budget', filters.maxBudget)

    query.then(({ data }) => {
      setCards(data ?? [])
      setLoading(false)
    })
  }, [userId, filters.location, filters.maxBudget])

  const recordSwipe = async (cardId: string, direction: 'left' | 'right') => {
    if (!userId) return
    await supabase.from('swipes').insert({ card_id: cardId, direction, user_id: userId })
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  return { cards, loading, recordSwipe }
}

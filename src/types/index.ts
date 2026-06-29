export interface Card {
  id: string
  title: string
  description: string
  image_url?: string
  tags?: string[]
  created_at: string
  user_id: string
}

export interface SwipeAction {
  card_id: string
  direction: 'left' | 'right'
  user_id: string
  created_at: string
}

export type SwipeDirection = 'left' | 'right' | null

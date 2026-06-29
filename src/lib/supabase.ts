import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = !!(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('placeholder')
)

const supabaseUrl = isConfigured ? rawUrl! : 'https://placeholder.supabase.co'
const supabaseAnonKey = isConfigured ? rawKey! : 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

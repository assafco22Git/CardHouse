import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { SwipePage } from './pages/SwipePage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [page, setPage] = useState<'swipe' | 'admin'>('swipe')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: '#f5f0e6' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#c4952a', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) return <LoginPage onSignIn={signInWithGoogle} />

  if (page === 'admin') return <AdminPage user={user} onBack={() => setPage('swipe')} />

  return (
    <SwipePage
      user={user}
      onSignOut={signOut}
      isAdmin={true}
      onAdmin={() => setPage('admin')}
    />
  )
}

import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { SwipePage } from './pages/SwipePage'

export default function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-slate-900">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} />
  }

  return <SwipePage user={user} onSignOut={signOut} />
}

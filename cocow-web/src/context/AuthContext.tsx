import { createContext, useContext, useState, type ReactNode } from 'react'
import { logoutFromApi } from '../api'

export type AuthUser = {
  sub: string
  username?: string
  email?: string
  email_verified?: boolean
  [key: string]: unknown
}

type AuthContextType = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY_USER = 'auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  const login = (newUser: AuthUser) => {
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY_USER)
    logoutFromApi().catch(() => {}) // best-effort: clear server-side HttpOnly cookie
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

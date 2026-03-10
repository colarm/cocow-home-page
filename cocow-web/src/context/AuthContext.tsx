import { createContext, useContext, useState, type ReactNode } from 'react'

export type AuthUser = {
  sub: string
  username?: string
  email?: string
  email_verified?: boolean
  [key: string]: unknown
}

type AuthContextType = {
  user: AuthUser | null
  accessToken: string | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY_USER = 'auth_user'
const STORAGE_KEY_TOKEN = 'auth_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_TOKEN)
  )

  const login = (newUser: AuthUser, token: string) => {
    setUser(newUser)
    setAccessToken(token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

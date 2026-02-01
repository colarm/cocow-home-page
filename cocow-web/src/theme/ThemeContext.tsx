import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getTheme, type ThemeId } from './themes'

interface ThemeContextType {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as ThemeId) || 'coconut'
  })

  useEffect(() => {
    const themeConfig = getTheme(theme)
    const root = document.documentElement

    // Apply theme colors as CSS variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      const cssVarName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      root.style.setProperty(`--color-${cssVarName}`, value)
    })

    localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

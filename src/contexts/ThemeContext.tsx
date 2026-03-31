'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ThemeName = 
  | 'default' 
  | 'light' 
  | 'dracula' 
  | 'gruvbox-dark' 
  | 'gruvbox-light'
  | 'catppuccin-mocha' 
  | 'catppuccin-latte'
  | 'ayu-dark' 
  | 'ayu-light'
  | 'rose-pine' 
  | 'rose-pine-light'

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: { name: ThemeName; label: string }[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themes: { name: ThemeName; label: string }[] = [
  { name: 'default', label: 'Default (Dark)' },
  { name: 'light', label: 'Light' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'gruvbox-dark', label: 'Gruvbox Dark' },
  { name: 'gruvbox-light', label: 'Gruvbox Light' },
  { name: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
  { name: 'catppuccin-latte', label: 'Catppuccin Latte' },
  { name: 'ayu-dark', label: 'Ayu Dark' },
  { name: 'ayu-light', label: 'Ayu Light' },
  { name: 'rose-pine', label: 'Rosé Pine' },
  { name: 'rose-pine-light', label: 'Rosé Pine Light' },
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('dracula')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('mission-control-theme') as ThemeName | null
    if (saved && themes.some(t => t.name === saved)) {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Remove all theme classes
    document.documentElement.className = ''
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`)
    // Save to localStorage
    localStorage.setItem('mission-control-theme', theme)
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

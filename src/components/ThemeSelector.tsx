'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Palette } from 'lucide-react'

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="dropdown is-dropup is-left">
      <div className="dropdown-trigger">
        <button
          className="button"
          title="Change theme"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>
      
      <div className="dropdown-menu">
        <div className="dropdown-content">
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`dropdown-item w-full align-left ${
                theme === t.name ? 'is-active' : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

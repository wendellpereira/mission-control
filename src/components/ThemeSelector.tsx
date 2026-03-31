'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Palette } from 'lucide-react'

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-800 rounded transition-colors w-full"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden group-hover:block">Theme</span>
      </button>
      
      <div className="absolute left-full bottom-0 mb-0 ml-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 min-w-[160px]">
          <div className="text-xs text-gray-500 px-2 py-1 mb-1">Select Theme</div>
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                theme === t.name 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
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

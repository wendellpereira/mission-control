'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  CheckSquare, 
  Film, 
  Calendar, 
  Brain, 
  Users,
  Rocket
} from 'lucide-react'
import ThemeSelector from './ThemeSelector'

const navItems = [
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/content', label: 'Content', icon: Film },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/team', label: 'Team', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-4 border-r z-40" 
           style={{ 
             backgroundColor: 'var(--surface)', 
             borderColor: 'var(--border-color)' 
           }}>
      <div className="mb-6">
        <Rocket className="w-7 h-7" style={{ color: 'var(--primary)' }} />
      </div>
      
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-11 h-11 flex items-center justify-center rounded transition-colors group relative"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--terminal-bg)' : 'var(--muted)'
              }}
              title={item.label}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface)'
                  e.currentTarget.style.color = 'var(--terminal-fg)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--muted)'
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span 
                className="absolute left-full ml-2 px-2 py-1 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  color: 'var(--terminal-fg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <ThemeSelector />
      </div>
    </aside>
  )
}

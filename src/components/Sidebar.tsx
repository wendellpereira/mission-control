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
    <aside className="fixed left-0 top-0 h-full w-16 bg-gray-900 flex flex-col items-center py-6 border-r border-gray-800">
      <div className="mb-8">
        <Rocket className="w-8 h-8 text-blue-500" />
      </div>
      
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors group relative ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

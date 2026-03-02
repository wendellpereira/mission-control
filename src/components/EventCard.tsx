'use client'

import { Clock, Tag, User } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  time: string | null
  type: string | null
  agentId: string | null
  color: string | null
  recurring: boolean
  createdAt: Date
  updatedAt: Date
}

interface EventCardProps {
  event: Event
}

const typeColors: Record<string, string> = {
  MEETING: 'border-blue-500',
  DEADLINE: 'border-red-500',
  REMINDER: 'border-yellow-500',
  EVENT: 'border-green-500',
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-3 border-l-4 ${typeColors[event.type || ''] || 'border-gray-500'}`}>
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-white font-medium text-sm">{event.title}</h3>
        {event.recurring && (
          <span className="text-xs text-gray-500">🔄</span>
        )}
      </div>
      
      {event.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{event.description}</p>
      )}
      
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {event.time && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{event.time}</span>
          </div>
        )}
        {event.type && (
          <span className="text-gray-400">{event.type}</span>
        )}
      </div>
    </div>
  )
}

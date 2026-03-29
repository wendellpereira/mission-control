'use client'

import { Calendar, Tag, Youtube, Instagram, Twitter, Edit, Trash2 } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  idea: string | null
  script: string | null
  thumbnail: string | null
  status: string
  platform: string | null
  scheduledDate: Date | null
  publishedAt: Date | null
  tags: string | null
  createdAt: Date
  updatedAt: Date
}

interface ContentCardProps {
  item: ContentItem
  onEdit?: (item: ContentItem) => void
  onDelete?: (itemId: string) => void
}

const statusColors: Record<string, string> = {
  IDEAS: 'bg-purple-500',
  SCRIPT: 'bg-blue-500',
  THUMBNAIL: 'bg-cyan-500',
  FILMING: 'bg-orange-500',
  PUBLISHED: 'bg-green-500',
}

const platformIcons: Record<string, React.ReactNode> = {
  YOUTUBE: <Youtube className="w-4 h-4" />,
  INSTAGRAM: <Instagram className="w-4 h-4" />,
  TWITTER: <Twitter className="w-4 h-4" />,
}

export default function ContentCard({ item, onEdit, onDelete }: ContentCardProps) {
  const tags = item.tags ? JSON.parse(item.tags) : []

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(item)
    }
  }
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700 min-w-[280px] max-w-[280px] group cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-medium text-sm flex-1">{item.title}</h3>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 text-xs rounded text-white ${statusColors[item.status] || 'bg-gray-500'}`}>
            {item.status}
          </span>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(item)
              }}
              className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit content"
            >
              <Edit className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Are you sure you want to delete this content?')) {
                  onDelete(item.id)
                }
              }}
              className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete content"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      </div>
      
      {item.idea && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-3">{item.idea}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        {item.platform && (
          <div className="flex items-center gap-1 text-gray-300">
            {platformIcons[item.platform] || item.platform}
            <span>{item.platform}</span>
          </div>
        )}
        {item.scheduledDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

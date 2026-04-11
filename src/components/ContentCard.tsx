'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Calendar, Tag, Youtube, Instagram, Twitter, Edit, Trash2 } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  idea: string | null
  script: string | null
  thumbnail: string | null
  status: string
  platform: string | null
  scheduledDate: string | Date | null
  publishedAt: string | Date | null
  tags: string | null
  createdAt: Date
  updatedAt: Date
}

interface ContentCardProps {
  item: ContentItem
  index: number
  onEdit?: (item: ContentItem) => void
  onDelete?: (itemId: string) => void
}

const statusColors: Record<string, string> = {
  IDEAS: 'is-primary',
  SCRIPT: 'is-info',
  THUMBNAIL: 'is-success',
  FILMING: 'is-warning',
  PUBLISHED: 'is-success',
}

const platformIcons: Record<string, React.ReactNode> = {
  YOUTUBE: <Youtube className="w-4 h-4" />,
  INSTAGRAM: <Instagram className="w-4 h-4" />,
  TWITTER: <Twitter className="w-4 h-4" />,
}

export default function ContentCard({ item, index, onEdit, onDelete }: ContentCardProps) {
  const tags = item.tags ? JSON.parse(item.tags) : []

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(item)
    }
  }

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`card ${snapshot.isDragging ? 'is-selected' : ''}`}
        >
          <div className="card-header">
            <div className="card-header-title">{item.title}</div>
            <div className="flex items-center gap-1">
              <span className={`tag ${statusColors[item.status] || 'is-muted'}`}>
                {item.status}
              </span>
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(item)
                  }}
                  className="button is-small"
                  title="Edit content"
                >
                  <Edit className="w-3.5 h-3.5" />
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
                  className="button is-danger is-small"
                  title="Delete content"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {item.idea && (
            <div className="card-content">
              <p className="has-text-muted">{item.idea}</p>
            </div>
          )}

          <div className="card-footer">
            <div className="flex items-center justify-between text-xs">
              {item.platform && (
                <div className="flex items-center gap-1">
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
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

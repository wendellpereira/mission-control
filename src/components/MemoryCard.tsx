'use client'

import { Calendar, Tag, BookOpen, Edit, Trash2 } from 'lucide-react'

interface Memory {
  id: string
  title: string
  content: string
  tags: string | null
  source: string | null
  createdAt: Date
  updatedAt: Date
}

interface MemoryCardProps {
  memory: Memory
  onEdit?: (memory: Memory) => void
  onDelete?: (memoryId: string) => void
}

export default function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const tags = memory.tags ? JSON.parse(memory.tags) : []
  
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-white font-medium text-sm flex-1">{memory.title}</h3>
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(memory)
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit memory"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to delete this memory?')) {
                      onDelete(memory.id)
                    }
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-xs line-clamp-2 mb-2">{memory.content}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            {memory.source && (
              <span className="text-gray-400">{memory.source}</span>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
            </div>
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
      </div>
    </div>
  )
}

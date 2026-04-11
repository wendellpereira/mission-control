'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Calendar, Zap } from 'lucide-react'
import { parseTaskTags, type Task } from '@/lib/tasks'

interface TaskCardProps {
  task: Task
  index: number
  onEdit?: (task: Task) => void
  onTrigger?: (task: Task) => void
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-600',
  HIGH: 'bg-orange-600',
  URGENT: 'bg-red-600',
}

export default function TaskCard({ task, index, onEdit, onTrigger }: TaskCardProps) {
  const tags = parseTaskTags(task.tags)
  const canTrigger = task.status === 'READY_FOR_ZE'

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`bg-gray-800 rounded-lg p-4 border border-gray-700 min-w-[280px] max-w-[280px] mb-3 group cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-colors ${
            snapshot.isDragging ? 'shadow-lg shadow-blue-500/20' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-white font-medium text-sm flex-1 break-words">{task.title}</h3>
            <div className="flex shrink-0 items-center gap-1">
              {task.priority && (
                <span className={`px-2 py-0.5 text-xs rounded text-white ${priorityColors[task.priority] || 'bg-gray-500'}`}>
                  {task.priority}
                </span>
              )}
              {canTrigger && onTrigger && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTrigger(task)
                  }}
                  className="p-1 text-yellow-400 hover:bg-gray-700 rounded transition-colors"
                  title="Trigger Ze to work on this task"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-gray-400 text-xs mb-3 line-clamp-5">{task.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {!!tags && tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

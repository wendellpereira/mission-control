'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Calendar, Tag, User, AlertCircle, Edit, Trash2, Zap } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  assignee: string | null
  tags: string | null
  createdAt: Date
  updatedAt: Date
}

interface TaskCardProps {
  task: Task
  index: number
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onTrigger?: (task: Task) => void
}

const agentMap: Record<string, string> = {
  'Ze': 'ze',
  'Carteiro': 'carteiro',
  'wellProg': 'wellprog',
  'OCManager': 'ocmanager',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
}

export default function TaskCard({ task, index, onEdit, onDelete, onTrigger }: TaskCardProps) {
  const tags = task.tags ? JSON.parse(task.tags) : []
  const canTrigger = task.status.startsWith('READY_FOR_') && task.assignee && agentMap[task.assignee]

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 group ${
            snapshot.isDragging ? 'shadow-lg shadow-blue-500/20' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-medium text-sm flex-1">{task.title}</h3>
            <div className="flex items-center gap-1">
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
                  className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 rounded transition-colors"
                  title={`Trigger ${task.assignee} to work on this task`}
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit task"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      onDelete(task.id)
                    }
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{task.assignee}</span>
              </div>
            )}
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

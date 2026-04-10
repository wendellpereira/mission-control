'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Calendar, Tag, User, AlertCircle, Zap } from 'lucide-react'

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
  onTrigger?: (task: Task) => void
}

const agentMap: Record<string, string> = {
  'Ze': 'ze',
  'Carteiro': 'carteiro',
  'wellProg': 'wellprog',
  'OCManager': 'ocmanager',
}

const priorityColors: Record<string, string> = {
  LOW: 'is-muted',
  MEDIUM: 'is-warning',
  HIGH: 'is-warning',
  URGENT: 'is-danger',
}

export default function TaskCard({ task, index, onEdit, onTrigger }: TaskCardProps) {
  const tags = task.tags ? JSON.parse(task.tags) : []
  const canTrigger = task.status.startsWith('READY_FOR_') && task.assignee && agentMap[task.assignee]

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
          className={`card ${snapshot.isDragging ? 'is-selected' : ''}`}
        >
          <div className="card-header">
            <div className="card-header-title">{task.title}</div>
            <div className="flex items-center gap-1">
              {task.priority && (
                <span className={`tag ${priorityColors[task.priority] || 'is-muted'}`}>
                  {task.priority}
                </span>
              )}
              {canTrigger && onTrigger && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTrigger(task)
                  }}
                  className="button is-warning is-small"
                  title={`Trigger ${task.assignee} to work on this task`}
                >
                  <Zap className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <div className="card-content">
              <p className="has-text-muted line-clamp-5">{task.description}</p>
            </div>
          )}

          <div className="card-footer">
            <div className="flex items-center justify-between text-xs">
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

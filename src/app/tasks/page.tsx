'use client'

import { useState, useEffect, useMemo } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import { Plus, Filter, X } from 'lucide-react'

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

const columns = [
  { id: 'BACKLOG', title: 'Backlog', color: 'bg-gray-600' },
  { id: 'READY_FOR_CARTEIRO', title: 'Carteiro', color: 'bg-blue-600' },
  { id: 'READY_FOR_ZE', title: 'Ze', color: 'bg-purple-600' },
  { id: 'READY_FOR_WELLPROG', title: 'wellProg', color: 'bg-cyan-600' },
  { id: 'READY_FOR_OCMANAGER', title: 'OCManager', color: 'bg-yellow-600' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-orange-600' },
  { id: 'REVIEW', title: 'Review', color: 'bg-pink-600' },
  { id: 'APPROVED', title: 'Approved', color: 'bg-green-600' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-600' },
]

const agentOptions = ['Ze', 'Carteiro', 'wellProg', 'OCManager']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterAgent, setFilterAgent] = useState<string>('')
  const [filterTag, setFilterTag] = useState<string>('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Collect all unique tags across tasks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    tasks.forEach(task => {
      if (task.tags) {
        try {
          const parsed = JSON.parse(task.tags)
          if (Array.isArray(parsed)) parsed.forEach(t => tagSet.add(t))
        } catch {
          // ignore
        }
      }
    })
    return Array.from(tagSet).sort()
  }, [tasks])

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })
        if (!res.ok) throw new Error('Failed to update task')
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })
        if (!res.ok) throw new Error('Failed to create task')
      }
      fetchTasks()
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete task')
      fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task')
    }
  }

  const handleTriggerTask = async (task: Task) => {
    const agentMap: Record<string, string> = {
      'Ze': 'ze',
      'Carteiro': 'carteiro',
      'wellProg': 'wellprog',
      'OCManager': 'ocmanager',
    }

    const agentId = task.assignee ? agentMap[task.assignee] : null
    if (!agentId) {
      alert('No agent assigned to this task')
      return
    }

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })

      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, agentId }),
      })

      if (!res.ok) throw new Error('Failed to trigger agent')

      alert(`🚀 ${task.assignee} triggered! Check the agent's output.`)
      fetchTasks()
    } catch (error) {
      console.error('Failed to trigger agent:', error)
      alert('Failed to trigger agent')
    }
  }

  const openNewTaskModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    const updatedTask = { ...task, status: destination.droppableId }
    setTasks(prev => prev.map(t => t.id === draggableId ? updatedTask : t))

    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      fetchTasks()
    }
  }

  const getTasksByColumn = (columnId: string) =>
    tasks.filter(task => {
      if (task.status !== columnId) return false
      if (filterAgent && task.assignee !== filterAgent) return false
      if (filterTag) {
        try {
          const parsed = JSON.parse(task.tags || '[]')
          if (!Array.isArray(parsed) || !parsed.includes(filterTag)) return false
        } catch {
          return false
        }
      }
      return true
    })

  const hasActiveFilters = filterAgent || filterTag

  const clearFilters = () => {
    setFilterAgent('')
    setFilterTag('')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="terminal h-screen">
      <div className="terminal-header">
        <div className="flex items-center justify-between w-full">
          <h1 className="title is-5">TASKS<span className="has-terminal-cursor">_</span></h1>

          {/* New Task */}
          <button onClick={openNewTaskModal} className="button is-primary">
            <Plus className="w-4 h-4" />
            New Task
          </button>

          <div className="flex items-center gap-3 flex-wrap mr-24">

            {/* Filter by Agent */}
            <div className="dropdown">
              <div className="dropdown-trigger">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="control">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <button className="button">
                        {filterAgent || 'Agent'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <button
                    onClick={() => setFilterAgent('')}
                    className={`dropdown-item w-full ${!filterAgent ? 'is-active' : ''}`}
                  >
                    All Agents
                  </button>
                  {agentOptions.map(agent => (
                    <button
                      key={agent}
                      onClick={() => setFilterAgent(agent)}
                      className={`dropdown-item w-full ${filterAgent === agent ? 'is-active' : ''}`}
                    >
                      {agent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter by Tag */}
            <div className="dropdown">
              <div className="dropdown-trigger">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="control">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <button className="button w-full">
                        {filterTag || 'Tag'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <button
                    onClick={() => setFilterTag('')}
                    className={`dropdown-item w-full ${!filterTag ? 'is-active' : ''}`}
                  >
                    All Tags
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`dropdown-item w-full ${filterTag === tag ? 'is-active' : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="button">
                <X className="w-3 h-3" />
                Clear
              </button>
            )}

          </div>
        </div>
      </div>

      <div className="terminal-body">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col w-72 h-full">
                <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
                  <span className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h2 className="text-sm font-medium">{column.title}</h2>
                  <span className="text-xs has-text-muted">
                    {getTasksByColumn(column.id).length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 transition-colors overflow-y-auto min-h-0 ${
                        snapshot.isDraggingOver ? 'has-background-dark' : ''
                      }`}
                    >
                      {getTasksByColumn(column.id).map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onEdit={openEditTaskModal}
                          onTrigger={handleTriggerTask}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}

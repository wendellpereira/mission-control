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
    <div className="h-screen flex flex-col p-6">
      {/* Header: title left, controls centered, spacer right */}
      <div className="flex items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white w-24 shrink-0">Tasks</h1>

        {/* Centered controls */}
        <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
          {/* New Task */}
          <button
            onClick={openNewTaskModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>

          {/* Filter by Agent */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterAgent}
              onChange={e => setFilterAgent(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Filter by Agent</option>
              {agentOptions.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          {/* Filter by Tag */}
          <div className="flex items-center gap-2">
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Filter by Tag</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Spacer to balance title */}
        <div className="w-24 shrink-0" />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col w-72 h-full">
                <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
                  <span className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h2 className="text-sm font-medium text-gray-300">{column.title}</h2>
                  <span className="text-xs text-gray-500">
                    {getTasksByColumn(column.id).length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 rounded-lg transition-colors overflow-y-auto min-h-0 ${
                        snapshot.isDraggingOver ? 'bg-gray-800/50' : 'bg-gray-900/50'
                      }`}
                    >
                      {getTasksByColumn(column.id).map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onEdit={openEditTaskModal}
                          onDelete={handleDeleteTask}
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
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  )
}

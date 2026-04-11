'use client'

import { useState, useEffect, useMemo } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import { Plus, Filter, X } from 'lucide-react'
import { collectTaskTags, getTasksResponseError, parseTasksResponse, taskHasTag, type Task } from '@/lib/tasks'

const columns = [
  { id: 'BACKLOG', title: 'Backlog', color: 'bg-gray-600' },
  { id: 'READY_FOR_ZE', title: 'Ready for Ze', color: 'bg-purple-600' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-orange-600' },
  { id: 'REVIEW', title: 'Review', color: 'bg-pink-600' },
  { id: 'APPROVED', title: 'Approved', color: 'bg-green-600' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-600' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoadError('')
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(getTasksResponseError(data, res.status))
      }
      setTasks(parseTasksResponse(data))
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
      setLoadError(error instanceof Error ? error.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  // Collect all unique tags across tasks
  const allTags = useMemo(() => {
    return collectTaskTags(tasks)
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
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      })

      if (!res.ok) throw new Error('Failed to trigger agent')

      alert("Ze triggered. Check the agent's output.")
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
      if (filterTag && !taskHasTag(task, filterTag)) return false
      return true
    })

  const hasActiveFilters = filterTag

  const clearFilters = () => {
    setFilterTag('')
    setIsTagFilterOpen(false)
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
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openNewTaskModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTagFilterOpen(open => !open)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors min-w-[120px]"
              aria-expanded={isTagFilterOpen}
              aria-haspopup="menu"
            >
              <Filter className="w-4 h-4" />
              {filterTag || 'Tag'}
            </button>

            {isTagFilterOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setFilterTag('')
                    setIsTagFilterOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    !filterTag ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  role="menuitem"
                >
                  All Tags
                </button>
                {allTags.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No tags</div>
                ) : (
                  allTags.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        setFilterTag(tag)
                        setIsTagFilterOpen(false)
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                        filterTag === tag ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      role="menuitem"
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          Could not load tasks: {loadError}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 min-w-max h-full">
            {columns.map(column => {
              const columnTasks = getTasksByColumn(column.id)

              return (
                <div key={column.id} className="flex flex-col w-[300px]">
                  <div className={`border-b-2 ${column.color.replace('bg-', 'border-')} pb-2 mb-4`}>
                    <h2 className="text-lg font-semibold text-white">{column.title}</h2>
                    <p className="text-xs text-gray-500">{columnTasks.length} tasks</p>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 rounded-lg transition-colors overflow-y-auto max-h-[calc(100vh-200px)] ${
                          snapshot.isDraggingOver ? 'bg-gray-800/50' : ''
                        }`}
                      >
                        {columnTasks.map((task, index) => (
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
              )
            })}
          </div>
        </div>
      </DragDropContext>

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

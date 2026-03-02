'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import { Plus } from 'lucide-react'

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        // Update existing task
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })
        if (!res.ok) throw new Error('Failed to update task')
      } else {
        // Create new task
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
      // Update task status to IN_PROGRESS
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      
      // Trigger the agent
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

    // Optimistic update
    const updatedTask = { ...task, status: destination.droppableId }
    setTasks(prev => prev.map(t => t.id === draggableId ? updatedTask : t))

    // Update on server
    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      // Revert on error
      fetchTasks()
    }
  }

  const getTasksByColumn = (columnId: string) => 
    tasks.filter(task => task.status === columnId)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <button 
          onClick={openNewTaskModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
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
                      className={`flex-1 p-2 rounded-lg transition-colors ${
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

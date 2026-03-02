'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

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

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task | null
  onSave: (task: Partial<Task>) => void
}

const statusOptions = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'READY_FOR_CARTEIRO', label: 'Ready for Carteiro' },
  { value: 'READY_FOR_ZE', label: 'Ready for Ze' },
  { value: 'READY_FOR_WELLPROG', label: 'Ready for wellProg' },
  { value: 'READY_FOR_OCMANAGER', label: 'Ready for OCManager' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DONE', label: 'Done' },
]

const priorityOptions = [
  { value: '', label: 'No priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export default function TaskModal({ isOpen, onClose, task, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('BACKLOG')
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority || '')
      setAssignee(task.assignee || '')
      // Parse JSON array to space-separated string
      if (task.tags) {
        try {
          const tagsArray = JSON.parse(task.tags)
          setTags(Array.isArray(tagsArray) ? tagsArray.join(' ') : task.tags)
        } catch {
          setTags(task.tags)
        }
      } else {
        setTags('')
      }
    } else {
      setTitle('')
      setDescription('')
      setStatus('BACKLOG')
      setPriority('')
      setAssignee('')
      setTags('')
    }
    setErrors({})
  }, [task, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Parse space-separated tags to JSON array
    let tagsJson = null
    if (tags.trim()) {
      const tagsArray = tags.split(/\s+/).map(t => t.trim()).filter(t => t)
      if (tagsArray.length > 0) {
        tagsJson = JSON.stringify(tagsArray)
      }
    }

    onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority: priority || null,
      assignee: assignee.trim() || null,
      tags: tagsJson,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter task title"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Assignee
          </label>
          <input
            type="text"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter assignee name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="tag1 tag2 tag3"
          />
          <p className="text-xs text-gray-500 mt-1">Space-separated values</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

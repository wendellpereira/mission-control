'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

interface Event {
  id: string
  title: string
  description: string | null
  date: string | Date
  time: string | null
  type: string | null
  agentId: string | null
  color: string | null
  recurring: boolean
  createdAt: Date
  updatedAt: Date
}

interface Agent {
  id: string
  name: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
  agents?: Agent[]
  initialDate?: Date
  onSave: (event: Partial<Event>) => void
}

const typeOptions = [
  { value: '', label: 'No type' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'DEADLINE', label: 'Deadline' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'EVENT', label: 'Event' },
  { value: 'CRON', label: 'Cron Job' },
]

const colorOptions = [
  { value: '', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
]

export default function EventModal({ isOpen, onClose, event, agents = [], initialDate, onSave }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [agentId, setAgentId] = useState('')
  const [color, setColor] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setDate(new Date(event.date).toISOString().split('T')[0])
      setTime(event.time || '')
      setType(event.type || '')
      setAgentId(event.agentId || '')
      setColor(event.color || '')
      setRecurring(event.recurring)
    } else {
      setTitle('')
      setDescription('')
      // Use initialDate if provided, otherwise default to today
      const defaultDate = initialDate || new Date()
      setDate(defaultDate.toISOString().split('T')[0])
      setTime('')
      setType('')
      setAgentId('')
      setColor('')
      setRecurring(false)
    }
    setErrors({})
  }, [event, isOpen, initialDate])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!date) newErrors.date = 'Date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      id: event?.id,
      title: title.trim(),
      description: description.trim() || null,
      date,
      time: time || null,
      type: type || null,
      agentId: agentId || null,
      color: color || null,
      recurring,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event' : 'New Event'}
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
            placeholder="Enter event title"
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
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Color
            </label>
            <select
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Assign to Agent
          </label>
          <select
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">No agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={e => setRecurring(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
          />
          <label htmlFor="recurring" className="text-sm text-gray-300">
            Recurring event
          </label>
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
            {event ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

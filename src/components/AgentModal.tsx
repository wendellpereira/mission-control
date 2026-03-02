'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

interface Agent {
  id: string
  name: string
  role: string | null
  description: string | null
  status: string | null
  lastActive: Date | null
  specializations: string | null
  createdAt: Date
  updatedAt: Date
}

interface AgentModalProps {
  isOpen: boolean
  onClose: () => void
  agent?: Agent | null
  onSave: (agent: Partial<Agent>) => void
}

const statusOptions = [
  { value: '', label: 'No status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'OFFLINE', label: 'Offline' },
]

export default function AgentModal({ isOpen, onClose, agent, onSave }: AgentModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [specializations, setSpecializations] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setRole(agent.role || '')
      setDescription(agent.description || '')
      setStatus(agent.status || '')
      // Parse JSON array to space-separated string
      if (agent.specializations) {
        try {
          const specsArray = JSON.parse(agent.specializations)
          setSpecializations(Array.isArray(specsArray) ? specsArray.join(' ') : agent.specializations)
        } catch {
          setSpecializations(agent.specializations)
        }
      } else {
        setSpecializations('')
      }
    } else {
      setName('')
      setRole('')
      setDescription('')
      setStatus('OFFLINE')
      setSpecializations('')
    }
    setErrors({})
  }, [agent, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Parse space-separated specializations to JSON array
    let specsJson = null
    if (specializations.trim()) {
      const specsArray = specializations.split(/\s+/).map(s => s.trim()).filter(s => s)
      if (specsArray.length > 0) {
        specsJson = JSON.stringify(specsArray)
      }
    }

    onSave({
      id: agent?.id,
      name: name.trim(),
      role: role.trim() || null,
      description: description.trim() || null,
      status: status || null,
      specializations: specsJson,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agent ? 'Edit Agent' : 'New Agent'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter agent name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g., Content Creator, Task Manager"
          />
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
            placeholder="Describe the agent's purpose and capabilities"
          />
        </div>

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
            Specializations
          </label>
          <input
            type="text"
            value={specializations}
            onChange={e => setSpecializations(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="skill1 skill2 skill3"
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
            {agent ? 'Save Changes' : 'Create Agent'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

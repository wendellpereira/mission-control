'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

interface Memory {
  id: string
  title: string
  content: string
  tags: string | null
  source: string | null
  createdAt: Date
  updatedAt: Date
}

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  memory?: Memory | null
  onSave: (memory: Partial<Memory>) => void
}

export default function MemoryModal({ isOpen, onClose, memory, onSave }: MemoryModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [source, setSource] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (memory) {
      setTitle(memory.title)
      setContent(memory.content)
      // Parse JSON array to space-separated string
      if (memory.tags) {
        try {
          const tagsArray = JSON.parse(memory.tags)
          setTags(Array.isArray(tagsArray) ? tagsArray.join(' ') : memory.tags)
        } catch {
          setTags(memory.tags)
        }
      } else {
        setTags('')
      }
      setSource(memory.source || '')
    } else {
      setTitle('')
      setContent('')
      setTags('')
      setSource('')
    }
    setErrors({})
  }, [memory, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!content.trim()) newErrors.content = 'Content is required'
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
      id: memory?.id,
      title: title.trim(),
      content: content.trim(),
      tags: tagsJson,
      source: source.trim() || null,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memory ? 'Edit Memory' : 'New Memory'}
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
            placeholder="Enter memory title"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content *
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter memory content (supports markdown)"
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Source
          </label>
          <input
            type="text"
            value={source}
            onChange={e => setSource(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Where did this memory come from?"
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
            {memory ? 'Save Changes' : 'Create Memory'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

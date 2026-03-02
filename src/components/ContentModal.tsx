'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

interface ContentItem {
  id: string
  title: string
  idea: string | null
  script: string | null
  thumbnail: string | null
  status: string
  platform: string | null
  scheduledDate: string | Date | null
  publishedAt: string | Date | null
  tags: string | null
  createdAt: Date
  updatedAt: Date
}

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  item?: ContentItem | null
  onSave: (item: Partial<ContentItem>) => void
}

const statusOptions = [
  { value: 'IDEAS', label: 'Ideas' },
  { value: 'SCRIPT', label: 'Script' },
  { value: 'THUMBNAIL', label: 'Thumbnail' },
  { value: 'FILMING', label: 'Filming' },
  { value: 'PUBLISHED', label: 'Published' },
]

const platformOptions = [
  { value: '', label: 'No platform' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TWITTER', label: 'Twitter/X' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
]

export default function ContentModal({ isOpen, onClose, item, onSave }: ContentModalProps) {
  const [title, setTitle] = useState('')
  const [idea, setIdea] = useState('')
  const [script, setScript] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [status, setStatus] = useState('IDEAS')
  const [platform, setPlatform] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setIdea(item.idea || '')
      setScript(item.script || '')
      setThumbnail(item.thumbnail || '')
      setStatus(item.status)
      setPlatform(item.platform || '')
      setScheduledDate(item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : '')
      setPublishedAt(item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '')
      // Parse JSON array to space-separated string
      if (item.tags) {
        try {
          const tagsArray = JSON.parse(item.tags)
          setTags(Array.isArray(tagsArray) ? tagsArray.join(' ') : item.tags)
        } catch {
          setTags(item.tags)
        }
      } else {
        setTags('')
      }
    } else {
      setTitle('')
      setIdea('')
      setScript('')
      setThumbnail('')
      setStatus('IDEAS')
      setPlatform('')
      setScheduledDate('')
      setPublishedAt('')
      setTags('')
    }
    setErrors({})
  }, [item, isOpen])

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
      id: item?.id,
      title: title.trim(),
      idea: idea.trim() || null,
      script: script.trim() || null,
      thumbnail: thumbnail.trim() || null,
      status,
      platform: platform || null,
      scheduledDate: scheduledDate || null,
      publishedAt: publishedAt || null,
      tags: tagsJson,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Content' : 'New Content'}
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
            placeholder="Enter content title"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Idea
          </label>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Describe the content idea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Script
          </label>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Enter the script or outline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Thumbnail URL
          </label>
          <input
            type="text"
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter thumbnail URL"
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
              Platform
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {platformOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Published Date
            </label>
            <input
              type="date"
              value={publishedAt}
              onChange={e => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
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
            {item ? 'Save Changes' : 'Create Content'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

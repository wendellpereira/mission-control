'use client'

import { useState, useEffect } from 'react'
import ContentCard from '@/components/ContentCard'
import ContentModal from '@/components/ContentModal'
import { Plus, ChevronRight } from 'lucide-react'

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

const stages = [
  { id: 'IDEAS', title: 'Ideas', color: 'border-purple-500' },
  { id: 'SCRIPT', title: 'Script', color: 'border-blue-500' },
  { id: 'THUMBNAIL', title: 'Thumbnail', color: 'border-cyan-500' },
  { id: 'FILMING', title: 'Filming', color: 'border-orange-500' },
  { id: 'PUBLISHED', title: 'Published', color: 'border-green-500' },
]

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContent = async (itemData: Partial<ContentItem>) => {
    try {
      if (itemData.id) {
        // Update existing content
        const res = await fetch(`/api/content/${itemData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (!res.ok) throw new Error('Failed to update content')
      } else {
        // Create new content
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (!res.ok) throw new Error('Failed to create content')
      }
      fetchContent()
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content')
    }
  }

  const handleDeleteContent = async (itemId: string) => {
    try {
      const res = await fetch(`/api/content/${itemId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete content')
      fetchContent()
    } catch (error) {
      console.error('Failed to delete content:', error)
      alert('Failed to delete content')
    }
  }

  const openNewContentModal = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const openEditContentModal = (item: ContentItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const getItemsByStage = (stageId: string) =>
    items.filter(item => item.status === stageId)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
        <button 
          onClick={openNewContentModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Content
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-start">
              <div className="flex flex-col w-[300px]">
                <div className={`border-b-2 ${stage.color} pb-2 mb-4`}>
                  <h2 className="text-lg font-semibold text-white">{stage.title}</h2>
                  <p className="text-xs text-gray-500">{getItemsByStage(stage.id).length} items</p>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {getItemsByStage(stage.id).map(item => (
                    <ContentCard 
                      key={item.id} 
                      item={item} 
                      onEdit={openEditContentModal}
                      onDelete={handleDeleteContent}
                    />
                  ))}
                </div>
              </div>
              
              {index < stages.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-600 mt-8 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        item={editingItem}
        onSave={handleSaveContent}
      />
    </div>
  )
}

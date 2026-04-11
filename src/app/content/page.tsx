'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import ContentCard from '@/components/ContentCard'
import ContentModal from '@/components/ContentModal'
import { Plus } from 'lucide-react'

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const item = items.find(i => i.id === draggableId)
    if (!item) return

    const updatedItem = { ...item, status: destination.droppableId }
    setItems(prev => prev.map(i => i.id === draggableId ? updatedItem : i))

    try {
      await fetch(`/api/content/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      })
    } catch (error) {
      console.error('Failed to update content:', error)
      fetchContent()
    }
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
    <div className="terminal h-screen">
      <div className="terminal-header">
        <div className="flex items-center justify-between">
          <h1 className="title is-5">CONTENT PIPELINE<span className="has-terminal-cursor">_</span></h1>
          <button onClick={openNewContentModal} className="button is-primary">
            <Plus className="w-4 h-4" />
            New Content
          </button>
        </div>
      </div>

      <div className="terminal-body">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full overflow-x-auto">
            {stages.map(stage => (
              <div key={stage.id} className="flex flex-col w-[300px]">
                <div className={`border-b-2 ${stage.color} pb-2 mb-4`}>
                  <h2 className="text-lg font-semibold">{stage.title}</h2>
                  <p className="text-xs has-text-muted">{getItemsByStage(stage.id).length} items</p>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 transition-colors overflow-y-auto max-h-[calc(100vh-200px)] ${
                        snapshot.isDraggingOver ? 'has-background-dark' : ''
                      }`}
                    >
                      {getItemsByStage(stage.id).map((item, index) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          index={index}
                          onEdit={openEditContentModal}
                          onDelete={handleDeleteContent}
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

      <ContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        item={editingItem}
        onSave={handleSaveContent}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import { Plus, Search, Filter } from 'lucide-react'

interface Memory {
  id: string
  title: string
  content: string
  tags: string | null
  source: string | null
  createdAt: Date
  updatedAt: Date
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories')
      const data = await res.json()
      setMemories(data)
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMemory = async (memoryData: Partial<Memory>) => {
    try {
      if (memoryData.id) {
        // Update existing memory
        const res = await fetch(`/api/memories/${memoryData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memoryData),
        })
        if (!res.ok) throw new Error('Failed to update memory')
      } else {
        // Create new memory
        const res = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memoryData),
        })
        if (!res.ok) throw new Error('Failed to create memory')
      }
      fetchMemories()
    } catch (error) {
      console.error('Failed to save memory:', error)
      alert('Failed to save memory')
    }
  }

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete memory')
      fetchMemories()
    } catch (error) {
      console.error('Failed to delete memory:', error)
      alert('Failed to delete memory')
    }
  }

  const openNewMemoryModal = () => {
    setEditingMemory(null)
    setIsModalOpen(true)
  }

  const openEditMemoryModal = (memory: Memory) => {
    setEditingMemory(memory)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMemory(null)
  }

  const filteredMemories = memories.filter(memory => 
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allTags = Array.from(new Set(memories.flatMap(m => m.tags ? JSON.parse(m.tags) : [])))

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading memories...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Memory Bank</h1>
        <button 
          onClick={openNewMemoryModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Memory
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 5).map((tag, i) => (
                <button
                  key={i}
                  className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>No memories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory}
                onEdit={openEditMemoryModal}
                onDelete={handleDeleteMemory}
              />
            ))}
          </div>
        )}
      </div>

      <MemoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        memory={editingMemory}
        onSave={handleSaveMemory}
      />
    </div>
  )
}

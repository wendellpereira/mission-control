'use client'

import { useState, useEffect } from 'react'
import AgentCard from '@/components/AgentCard'
import AgentModal from '@/components/AgentModal'
import { Activity, Plus } from 'lucide-react'

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

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAgent = async (agentData: Partial<Agent>) => {
    try {
      if (agentData.id) {
        // Update existing agent
        const res = await fetch(`/api/agents/${agentData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData),
        })
        if (!res.ok) throw new Error('Failed to update agent')
      } else {
        // Create new agent
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData),
        })
        if (!res.ok) throw new Error('Failed to create agent')
      }
      fetchAgents()
    } catch (error) {
      console.error('Failed to save agent:', error)
      alert('Failed to save agent')
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete agent')
      fetchAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
      alert('Failed to delete agent')
    }
  }

  const openNewAgentModal = () => {
    setEditingAgent(null)
    setIsModalOpen(true)
  }

  const openEditAgentModal = (agent: Agent) => {
    setEditingAgent(agent)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAgent(null)
  }

  const activeCount = agents.filter(a => a.status === 'ACTIVE').length
  const idleCount = agents.filter(a => a.status === 'IDLE').length
  const offlineCount = agents.filter(a => a.status === 'OFFLINE').length

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading team...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Team</h1>
          <p className="text-gray-400">Manage and monitor your AI agents</p>
        </div>
        <button 
          onClick={openNewAgentModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{idleCount}</p>
              <p className="text-sm text-gray-400">Idle</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{offlineCount}</p>
              <p className="text-sm text-gray-400">Offline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            onEdit={openEditAgentModal}
            onDelete={handleDeleteAgent}
          />
        ))}
      </div>

      <AgentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        agent={editingAgent}
        onSave={handleSaveAgent}
      />
    </div>
  )
}

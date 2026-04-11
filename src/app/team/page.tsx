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
  currentTask: string | null
  log: string | null
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
    <div className="terminal min-h-screen">
      <div className="terminal-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="title is-5">TEAM<span className="has-terminal-cursor">_</span></h1>
            <p className="subtitle is-6">Manage and monitor your AI agents</p>
          </div>
          <button onClick={openNewAgentModal} className="button is-primary">
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        </div>
      </div>

      <div className="terminal-body">
        {/* Status overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 has-text-success" />
                </div>
                <div>
                  <p className="title is-4">{activeCount}</p>
                  <p className="text-sm has-text-muted">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                </div>
                <div>
                  <p className="title is-4">{idleCount}</p>
                  <p className="text-sm has-text-muted">Idle</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
                </div>
                <div>
                  <p className="title is-4">{offlineCount}</p>
                  <p className="text-sm has-text-muted">Offline</p>
                </div>
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

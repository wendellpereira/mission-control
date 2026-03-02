'use client'

import { Activity, Clock, Star, Edit, Trash2 } from 'lucide-react'

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

interface AgentCardProps {
  agent: Agent
  onEdit?: (agent: Agent) => void
  onDelete?: (agentId: string) => void
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  IDLE: 'bg-yellow-500',
  OFFLINE: 'bg-gray-500',
}

const agentAvatars: Record<string, string> = {
  'Ze': '🧙',
  'Carteiro': '📮',
  'wellProg': '💻',
  'OCManager': '🤖',
}

export default function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const specializations = agent.specializations ? JSON.parse(agent.specializations) : []
  
  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
          {agentAvatars[agent.name] || '🤖'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{agent.name}</h3>
              <span className={`w-2 h-2 rounded-full ${statusColors[agent.status || ''] || 'bg-gray-500'}`} />
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(agent)}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit agent"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this agent?')) {
                      onDelete(agent.id)
                    }
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete agent"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
          
          {agent.role && (
            <p className="text-blue-400 text-sm mb-2">{agent.role}</p>
          )}
          
          {agent.description && (
            <p className="text-gray-400 text-xs mb-3">{agent.description}</p>
          )}
          
          {specializations.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {specializations.map((spec: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {spec}
                </span>
              ))}
            </div>
          )}
          
          {agent.lastActive && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last active: {new Date(agent.lastActive).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

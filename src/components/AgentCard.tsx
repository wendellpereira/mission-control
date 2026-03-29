'use client'

import { Clock, Edit, Star, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'

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

// Convert UTC timestamp in log entry to Central Time
function formatLogEntry(entry: string): string {
  // Match timestamp format: [2026-03-08T09:18:11.265Z]
  const match = entry.match(/^\[([^\]]+)\]\s*(.*)$/)
  if (!match) return entry
  
  const [, timestamp, message] = match
  try {
    const date = new Date(timestamp)
    // Format in Central Time (America/Chicago)
    const centralTime = date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `[${centralTime}] ${message}`
  } catch {
    return entry
  }
}

export default function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const specializations = agent.specializations ? JSON.parse(agent.specializations) : []
  const logEntries = agent.log ? agent.log.split('\n').filter(Boolean) : []

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(agent)
    }
  }
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-gray-800 rounded-lg p-5 border border-gray-700 group cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-colors"
    >
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(agent)
                  }}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit agent"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
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
          
          {/* Current Task */}
          {agent.currentTask && (
            <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">Working on:</span>
              </div>
              <p className="text-white text-sm mt-1">{agent.currentTask}</p>
            </div>
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
          
          {/* Activity Log */}
          {logEntries.length > 0 && (
            <div className="mb-3">
              <div className='text-xs pt-5 pl-2'>Activity Log ({logEntries.length}):</div>
              
              <div className="mt-2 max-h-40 overflow-y-auto bg-gray-900/50 rounded p-2 text-xs text-gray-300 font-mono">
                {logEntries.map((entry, i) => (
                  <div key={i} className="mb-1 last:mb-0">
                    {formatLogEntry(entry)}
                  </div>
                ))}
              </div>
            </div> 
          )}
          
          {agent.lastActive && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last active: {new Date(agent.lastActive).toLocaleString('en-US', {
                timeZone: 'America/Chicago',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

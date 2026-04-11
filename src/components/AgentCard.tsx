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
  ACTIVE: 'var(--success)',
  IDLE: 'var(--warning)',
  OFFLINE: 'var(--muted)',
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
      className="card"
    >
      <div className="card-header">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
            {agentAvatars[agent.name] || '🤖'}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="card-header-title">{agent.name}</h3>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColors[agent.status || 'OFFLINE'] || 'var(--muted)' }}
                />
              </div>
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(agent)
                    }}
                    className="button is-small"
                    title="Edit agent"
                  >
                    <Edit className="w-3.5 h-3.5" />
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
                    className="button is-danger is-small"
                    title="Delete agent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {agent.role && (
              <p className="has-text-primary text-sm">{agent.role}</p>
            )}
          </div>
        </div>
      </div>

      {agent.description && (
        <div className="card-content">
          <p className="has-text-muted">{agent.description}</p>
        </div>
      )}

      {/* Current Task */}
      {agent.currentTask && (
        <div className="card-content">
          <div className="p-2 border border-blue-500/30 rounded">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 has-text-primary" />
              <span className="text-xs has-text-primary">Working on:</span>
            </div>
            <p className="text-sm mt-1">{agent.currentTask}</p>
          </div>
        </div>
      )}

      {specializations.length > 0 && (
        <div className="card-content">
          <div className="flex flex-wrap gap-1">
            {specializations.map((spec: string, i: number) => (
              <span key={i} className="tag">
                <Star className="w-3 h-3" />
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      {logEntries.length > 0 && (
        <div className="card-content">
          <div className='text-xs has-text-muted'>Activity Log ({logEntries.length}):</div>

          <div className="terminal-log">
            {logEntries.map((entry, i) => (
              <div key={i} className="terminal-log-line">
                {formatLogEntry(entry)}
              </div>
            ))}
          </div>
        </div>
      )}

      {agent.lastActive && (
        <div className="card-footer">
          <div className="flex items-center gap-1 text-xs has-text-muted">
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
        </div>
      )}
    </div>
  )
}

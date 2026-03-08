import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/agents - Get all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(agents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        role: body.role,
        description: body.description,
        status: body.status || 'OFFLINE',
        currentTask: body.currentTask,
        log: body.log,
        lastActive: body.lastActive ? new Date(body.lastActive) : null,
        specializations: body.specializations,
      },
    })
    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}

// PATCH /api/agents - Update agent by name (for heartbeat updates)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, logEntry, ...updateData } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    // Find the agent by name
    const agent = await prisma.agent.findFirst({
      where: { name },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // If logEntry is provided, append it to the existing log
    let log = agent.log || ''
    if (logEntry) {
      const timestamp = new Date().toISOString()
      log = `[${timestamp}] ${logEntry}\n${log}`
      // Keep only last 50 entries to prevent log from growing too large
      const logLines = log.split('\n').filter(Boolean)
      if (logLines.length > 50) {
        log = logLines.slice(0, 50).join('\n')
      }
    }

    // Prepare update data
    const data: Record<string, unknown> = {
      ...updateData,
      log,
    }
    if (body.lastActive) data.lastActive = new Date(body.lastActive)

    // Update the agent
    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data,
    })

    return NextResponse.json(updatedAgent)
  } catch (error) {
    console.error('Failed to update agent:', error)
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}

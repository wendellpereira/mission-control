import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const ZE_AGENT_NAME = 'Ze'

// GET /api/agents - Get the single active OpenClaw agent
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: { name: ZE_AGENT_NAME },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(agents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

// POST /api/agents - Create the single active OpenClaw agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.name && String(body.name).toLowerCase() !== ZE_AGENT_NAME.toLowerCase()) {
      return NextResponse.json({ error: 'Only Ze is supported as an active agent' }, { status: 400 })
    }

    const agent = await prisma.agent.create({
      data: {
        name: ZE_AGENT_NAME,
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

    if (String(name).toLowerCase() !== ZE_AGENT_NAME.toLowerCase()) {
      return NextResponse.json({ error: 'Only Ze is supported as an active agent' }, { status: 404 })
    }

    // Find Ze by name
    const agent = await prisma.agent.findFirst({
      where: { name: ZE_AGENT_NAME },
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

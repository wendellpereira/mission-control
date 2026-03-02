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
        lastActive: body.lastActive ? new Date(body.lastActive) : null,
        specializations: body.specializations,
      },
    })
    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}

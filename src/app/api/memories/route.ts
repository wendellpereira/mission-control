import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/memories - Get all memories
export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(memories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

// POST /api/memories - Create a new memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.create({
      data: {
        title: body.title,
        content: body.content,
        tags: body.tags,
        source: body.source,
      },
    })
    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}

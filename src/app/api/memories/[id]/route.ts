import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/memories/[id] - Get a single memory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: params.id },
    })
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
  }
}

// PATCH /api/memories/[id] - Update a memory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}

// DELETE /api/memories/[id] - Delete a memory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.memory.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
}

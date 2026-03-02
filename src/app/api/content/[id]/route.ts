import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/content/[id] - Get a single content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.contentItem.findUnique({
      where: { id: params.id },
    })
    if (!item) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content item' }, { status: 500 })
  }
}

// PATCH /api/content/[id] - Update a content item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data: Record<string, unknown> = { ...body }
    if (body.scheduledDate) data.scheduledDate = new Date(body.scheduledDate)
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt)
    
    const item = await prisma.contentItem.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 })
  }
}

// DELETE /api/content/[id] - Delete a content item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contentItem.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete content item' }, { status: 500 })
  }
}

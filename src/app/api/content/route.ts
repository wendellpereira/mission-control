import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/content - Get all content items
export async function GET() {
  try {
    const items = await prisma.contentItem.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content items' }, { status: 500 })
  }
}

// POST /api/content - Create a new content item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.contentItem.create({
      data: {
        title: body.title,
        idea: body.idea,
        script: body.script,
        thumbnail: body.thumbnail,
        status: body.status || 'IDEAS',
        platform: body.platform,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        tags: body.tags,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 })
  }
}

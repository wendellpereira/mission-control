import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/trigger - Trigger an agent to work on a task
// This updates the task status. The actual agent execution happens via:
// 1. Heartbeat polling (agents check for IN_PROGRESS tasks periodically)
// 2. Direct notification (you tell the agent to work on it)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, agentId } = body

    if (!taskId || !agentId) {
      return NextResponse.json({ error: 'taskId and agentId are required' }, { status: 400 })
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Update task status to IN_PROGRESS
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    })

    // Build the notification message
    const agentNames: Record<string, string> = {
      'ze': 'Ze',
      'carteiro': 'Carteiro',
      'wellprog': 'wellProg',
      'ocmanager': 'OCManager',
    }
    
    const agentName = agentNames[agentId] || agentId
    const notificationMessage = `🚀 Task triggered!\n\nTask: ${task.title}\nAgent: ${agentName}\nStatus: IN_PROGRESS\n\nTo execute: Send "${agentName}: work on task ${task.id.substring(0, 8)}" to the agent`

    return NextResponse.json({ 
      success: true, 
      message: `Task moved to IN_PROGRESS. ${agentName} will pick it up on next heartbeat.`,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        assignee: updatedTask.assignee,
        status: updatedTask.status,
      },
      notification: notificationMessage,
      nextSteps: `The task is now IN_PROGRESS. ${agentName} will work on it during their next heartbeat check, or you can notify them directly.`
    })
  } catch (error) {
    console.error('Failed to trigger agent:', error)
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 })
  }
}

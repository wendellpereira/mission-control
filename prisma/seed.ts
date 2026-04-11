import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Enums as string constants
const TaskStatus = {
  BACKLOG: 'BACKLOG',
  READY_FOR_ZE: 'READY_FOR_ZE',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  APPROVED: 'APPROVED',
  DONE: 'DONE',
}

const ContentStatus = {
  IDEAS: 'IDEAS',
  SCRIPT: 'SCRIPT',
  THUMBNAIL: 'THUMBNAIL',
  FILMING: 'FILMING',
  PUBLISHED: 'PUBLISHED',
}

async function main() {
  // Clear existing data
  await prisma.event.deleteMany()
  await prisma.task.deleteMany()
  await prisma.contentItem.deleteMany()
  await prisma.memory.deleteMany()
  await prisma.agent.deleteMany()

  // Create the single active OpenClaw agent
  const ze = await prisma.agent.create({
    data: {
      name: 'Ze',
      role: 'Creative Director',
      description: 'Master of creative vision and content strategy',
      status: 'ACTIVE',
      lastActive: new Date(),
      specializations: JSON.stringify(['Creative Writing', 'Video Concepts', 'Storytelling']),
    },
  })

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design new landing page',
        description: 'Create a modern, responsive landing page for the new product launch',
        status: TaskStatus.IN_PROGRESS,
        priority: 'HIGH',
        tags: JSON.stringify(['design', 'web']),
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: TaskStatus.READY_FOR_ZE,
        priority: 'MEDIUM',
        tags: JSON.stringify(['devops', 'automation']),
      },
      {
        title: 'Review content calendar',
        description: 'Plan content for the next quarter',
        status: TaskStatus.READY_FOR_ZE,
        priority: 'HIGH',
        tags: JSON.stringify(['planning', 'content']),
      },
      {
        title: 'Write script for tutorial video',
        description: 'Create engaging tutorial for new users',
        status: TaskStatus.READY_FOR_ZE,
        priority: 'MEDIUM',
        tags: JSON.stringify(['content', 'video', 'tutorial']),
      },
      {
        title: 'Publish blog post',
        description: 'Final review and publish the AI trends article',
        status: TaskStatus.READY_FOR_ZE,
        priority: 'LOW',
        tags: JSON.stringify(['blog', 'publishing']),
      },
      {
        title: 'Update documentation',
        description: 'Add API reference for new endpoints',
        status: TaskStatus.BACKLOG,
        priority: 'LOW',
        tags: JSON.stringify(['docs', 'api']),
      },
      {
        title: 'Bug fix: Login flow',
        description: 'Fix issue with social login redirect',
        status: TaskStatus.REVIEW,
        priority: 'URGENT',
        tags: JSON.stringify(['bug', 'auth']),
      },
      {
        title: 'Marketing campaign design',
        description: 'Create assets for summer campaign',
        status: TaskStatus.APPROVED,
        priority: 'MEDIUM',
        tags: JSON.stringify(['marketing', 'design']),
      },
      {
        title: 'Database optimization',
        description: 'Improve query performance for dashboard',
        status: TaskStatus.DONE,
        priority: 'HIGH',
        tags: JSON.stringify(['database', 'performance']),
      },
    ],
  })

  // Create content items
  await prisma.contentItem.createMany({
    data: [
      {
        title: 'Getting Started with AI Agents',
        idea: 'A comprehensive guide for beginners on how to use AI agents effectively',
        script: 'Introduction to AI agents, their capabilities, and how to get started...',
        status: ContentStatus.FILMING,
        platform: 'YOUTUBE',
        scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        tags: JSON.stringify(['tutorial', 'ai', 'beginners']),
      },
      {
        title: 'Behind the Scenes: How We Built Mission Control',
        idea: 'Show the development process and architecture decisions',
        status: ContentStatus.SCRIPT,
        platform: 'YOUTUBE',
        tags: JSON.stringify(['behind-the-scenes', 'development']),
      },
      {
        title: '5 Tips for Productivity',
        idea: 'Quick tips for improving daily productivity using our tools',
        script: 'Tip 1: Use keyboard shortcuts...',
        thumbnail: 'thumbnail_v1.png',
        status: ContentStatus.THUMBNAIL,
        platform: 'INSTAGRAM',
        scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        tags: JSON.stringify(['productivity', 'tips', 'quick']),
      },
      {
        title: 'Monthly Update: February',
        idea: 'What we shipped this month and what is coming next',
        status: ContentStatus.IDEAS,
        platform: 'TWITTER',
        tags: JSON.stringify(['update', 'monthly']),
      },
      {
        title: 'Complete API Walkthrough',
        idea: 'Deep dive into all API endpoints and use cases',
        script: 'In this video, we cover every endpoint...',
        thumbnail: 'api_thumb.png',
        status: ContentStatus.PUBLISHED,
        platform: 'YOUTUBE',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        tags: JSON.stringify(['api', 'technical', 'documentation']),
      },
    ],
  })

  // Create events
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  await prisma.event.createMany({
    data: [
      {
        title: 'Team Standup',
        description: 'Daily sync meeting',
        date: tomorrow,
        time: '10:00',
        type: 'MEETING',
        agentId: ze.id,
        color: '#3b82f6',
        recurring: true,
      },
      {
        title: 'Content Review',
        description: 'Review pending content for approval',
        date: tomorrow,
        time: '14:00',
        type: 'MEETING',
        agentId: ze.id,
        color: '#8b5cf6',
        recurring: false,
      },
      {
        title: 'Sprint Planning',
        description: 'Plan tasks for the next sprint',
        date: nextWeek,
        time: '09:00',
        type: 'MEETING',
        agentId: ze.id,
        color: '#10b981',
        recurring: false,
      },
      {
        title: 'Video Launch',
        description: 'Publish new YouTube video',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        time: '12:00',
        type: 'DEADLINE',
        agentId: ze.id,
        color: '#ef4444',
        recurring: false,
      },
      {
        title: 'Code Review Session',
        description: 'Review pending pull requests',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        time: '15:00',
        type: 'MEETING',
        agentId: ze.id,
        color: '#f59e0b',
        recurring: true,
      },
    ],
  })

  // Create memories
  await prisma.memory.createMany({
    data: [
      {
        title: 'Project Goals 2024',
        content: 'Main objectives for this year:\n1. Launch Mission Control MVP\n2. Grow user base to 10K\n3. Establish content pipeline\n4. Keep Ze focused on the active mission queue',
        tags: JSON.stringify(['goals', 'planning', '2024']),
        source: 'Planning Session',
      },
      {
        title: 'Brand Guidelines',
        content: 'Our brand voice is professional yet approachable. Use clear language, avoid jargon. Primary color: Blue. Tone: Helpful, friendly, innovative.',
        tags: JSON.stringify(['brand', 'design', 'guidelines']),
        source: 'Design Doc',
      },
      {
        title: 'API Keys and Secrets',
        content: 'All API keys are stored in the .env file. Never commit secrets to git. Use environment variables for all sensitive data.',
        tags: JSON.stringify(['security', 'api', 'secrets']),
        source: 'Technical Notes',
      },
      {
        title: 'Content Strategy',
        content: 'Post frequency:\n- YouTube: 2x per week\n- Blog: 1x per week\n- Twitter: Daily\nFocus on educational content that provides value.',
        tags: JSON.stringify(['content', 'strategy', 'social']),
        source: 'Strategy Meeting',
      },
      {
        title: 'Agent Responsibilities',
        content: 'Ze is the single active OpenClaw agent for mission work, content, and automation follow-through.',
        tags: JSON.stringify(['team', 'roles', 'agents']),
        source: 'Team Structure',
      },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

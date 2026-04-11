export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  tags: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false

  const task = value as Partial<Task>
  return typeof task.id === 'string' && typeof task.title === 'string' && typeof task.status === 'string'
}

export function parseTasksResponse(value: unknown): Task[] {
  if (!Array.isArray(value)) return []
  return value.filter(isTask)
}

export function getTasksResponseError(value: unknown, status: number): string {
  if (value && typeof value === 'object' && 'error' in value && typeof value.error === 'string') {
    return value.error
  }

  return `Expected an array of tasks from /api/tasks, received HTTP ${status}.`
}

export function parseTaskTags(tags: string | null): string[] {
  if (!tags) return []

  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : []
  } catch {
    return []
  }
}

export function collectTaskTags(tasks: Task[]): string[] {
  const tagSet = new Set<string>()

  tasks.forEach(task => {
    parseTaskTags(task.tags).forEach(tag => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

export function taskHasTag(task: Task, tag: string): boolean {
  return parseTaskTags(task.tags).includes(tag)
}

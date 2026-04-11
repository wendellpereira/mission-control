import assert from 'node:assert/strict'
import test from 'node:test'
import { collectTaskTags, getTasksResponseError, parseTaskTags, parseTasksResponse, taskHasTag, type Task } from '../src/lib/tasks'

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Test task',
  description: null,
  status: 'BACKLOG',
  priority: null,
  tags: null,
  createdAt: '2026-04-11T00:00:00.000Z',
  updatedAt: '2026-04-11T00:00:00.000Z',
  ...overrides,
})

test('parseTasksResponse returns an empty list for non-array API responses', () => {
  assert.deepEqual(parseTasksResponse({ error: 'Failed to fetch tasks' }), [])
  assert.deepEqual(parseTasksResponse(null), [])
  assert.deepEqual(parseTasksResponse('not json array'), [])
})

test('getTasksResponseError preserves API error messages', () => {
  assert.equal(getTasksResponseError({ error: 'Failed to fetch tasks' }, 500), 'Failed to fetch tasks')
  assert.equal(
    getTasksResponseError({ message: 'not the API shape' }, 200),
    'Expected an array of tasks from /api/tasks, received HTTP 200.'
  )
})

test('parseTasksResponse keeps only task-shaped array items', () => {
  const validTask = task()

  assert.deepEqual(
    parseTasksResponse([validTask, { id: 'bad' }, null, { title: 'missing id', status: 'BACKLOG' }]),
    [validTask]
  )
})

test('parseTaskTags returns an empty list for invalid tag payloads', () => {
  assert.deepEqual(parseTaskTags(null), [])
  assert.deepEqual(parseTaskTags('not-json'), [])
  assert.deepEqual(parseTaskTags(JSON.stringify({ tag: 'design' })), [])
})

test('collectTaskTags sorts and de-duplicates valid tags', () => {
  assert.deepEqual(
    collectTaskTags([
      task({ tags: JSON.stringify(['video', 'design']) }),
      task({ id: 'task-2', tags: JSON.stringify(['design', 'ops', 123]) }),
      task({ id: 'task-3', tags: 'not-json' }),
    ]),
    ['design', 'ops', 'video']
  )
})

test('taskHasTag handles missing and invalid tags without throwing', () => {
  assert.equal(taskHasTag(task({ tags: JSON.stringify(['design']) }), 'design'), true)
  assert.equal(taskHasTag(task({ tags: 'not-json' }), 'design'), false)
  assert.equal(taskHasTag(task(), 'design'), false)
})

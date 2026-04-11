'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import EventModal from '@/components/EventModal'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  date: string | Date
  time: string | null
  type: string | null
  agentId: string | null
  color: string | null
  recurring: boolean
  createdAt: Date
  updatedAt: Date
}

interface Agent {
  id: string
  name: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchEvents()
    fetchAgents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      if (eventData.id) {
        // Update existing event
        const res = await fetch(`/api/events/${eventData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
        if (!res.ok) throw new Error('Failed to update event')
      } else {
        // Create new event
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
        if (!res.ok) throw new Error('Failed to create event')
      }
      fetchEvents()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      fetchEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
    }
  }

  const openNewEventModal = (date?: Date) => {
    setEditingEvent(null)
    setSelectedDate(date || new Date())
    setIsModalOpen(true)
  }

  const openEditEventModal = (event: Event) => {
    setEditingEvent(event)
    setSelectedDate(new Date(event.date))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setSelectedDate(null)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === day.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  // Override editingEvent with selectedDate for new events
  const eventForModal = editingEvent || (selectedDate ? { date: selectedDate } as Partial<Event> : null)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="terminal h-screen">
      <div className="terminal-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="title is-5">CALENDAR<span className="has-terminal-cursor">_</span></h1>
            <button onClick={goToToday} className="button">
              Today
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={previousMonth} className="button">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-medium min-w-[180px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="button">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => openNewEventModal()} className="button is-primary ml-4">
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>
      </div>

      <div className="terminal-body">
        <div className="h-full border border-gray-800 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-800">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium has-text-muted border-r border-gray-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 flex-1" style={{ height: 'calc(100% - 45px)' }}>
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : []
              const isToday = day && day.toDateString() === today.toDateString()

              return (
                <div
                  key={index}
                  className={`border-r border-b border-gray-800 last:border-r-0 ${
                    day ? 'cursor-pointer hover:has-background-dark' : 'has-background-dark'
                  }`}
                  onClick={() => day && openNewEventModal(day)}
                >
                  {day && (
                    <div className="p-2 h-full">
                      <div className={`text-sm mb-2 ${isToday ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center' : 'has-text-muted'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[100px]">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1.5 bg-gray-800 rounded has-text-muted truncate group relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                {event.time && <span className="has-text-muted">{event.time}</span>}
                                <span className="truncate">{event.title}</span>
                              </div>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditEventModal(event)
                                  }}
                                  className="p-0.5 hover:has-background-dark rounded"
                                  title="Edit event"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (window.confirm('Are you sure you want to delete this event?')) {
                                      handleDeleteEvent(event.id)
                                    }
                                  }}
                                  className="p-0.5 hover:has-background-dark rounded"
                                  title="Delete event"
                                >
                                  <Trash2 className="w-3 h-3 has-text-danger" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs has-text-muted pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={editingEvent}
        agents={agents}
        initialDate={selectedDate || undefined}
        onSave={handleSaveEvent}
      />
    </div>
  )
}

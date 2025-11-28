"use client"

import { EventDay } from "@/lib/events"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface CalendarNavigationProps {
  eventDays: EventDay[]
}

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  eventDay?: EventDay
}

export function CalendarNavigation({ eventDays }: CalendarNavigationProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  
  // Create a map for quick event lookup
  const eventMap = new Map<string, EventDay>()
  eventDays.forEach(event => {
    eventMap.set(event.date, event)
  })

  const getMonthData = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    // Start from the first day of the week
    startDate.setDate(startDate.getDate() - startDate.getDay())
    // End at the last day of the week
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days: CalendarDay[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateString = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0')
      const isCurrentMonth = currentDate.getMonth() === month
      
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        eventDay: eventMap.get(dateString)
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const monthData = getMonthData(currentDate)
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (dateString: string) => {
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0')
    return dateString === todayString
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (eventDays.length === 0) {
    return null
  }

  return (
    <div className="w-full mb-8 fade-in">
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Calendar</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            
            <h3 className="text-lg font-medium text-white min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="text-sm font-medium text-white/60">{day}</span>
            </div>
          ))}

          {/* Calendar days */}
          {monthData.map((calendarDay, index) => {
            const hasEvents = !!calendarDay.eventDay
            const isCurrentDay = isToday(calendarDay.date)
            
            return (
              <motion.div
                key={calendarDay.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01, duration: 0.2 }}
                className="aspect-square"
              >
                {hasEvents ? (
                  <Link
                    href={`/events/${calendarDay.date}`}
                    className={`
                      w-full h-full flex flex-col items-center justify-center rounded-lg transition-all duration-200 group
                      ${calendarDay.isCurrentMonth 
                        ? 'hover:bg-violet-500/30 bg-gradient-to-br from-violet-500/20 to-pink-500/20' 
                        : 'hover:bg-white/10 bg-white/5 opacity-50'
                      }
                      ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium group-hover:text-violet-300 transition-colors
                      ${calendarDay.isCurrentMonth ? 'text-white' : 'text-white/40'}
                      ${isCurrentDay ? 'text-blue-300' : ''}
                    `}>
                      {calendarDay.day}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 group-hover:bg-violet-300 transition-colors" />
                      <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                        {calendarDay.eventDay!.eventCount}
                      </span>
                    </div>
                    {calendarDay.eventDay!.totalSize > 0 && (
                      <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors mt-0.5">
                        {formatFileSize(calendarDay.eventDay!.totalSize)}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className={`
                    w-full h-full flex items-center justify-center rounded-lg
                    ${calendarDay.isCurrentMonth ? 'hover:bg-white/5' : 'opacity-30'}
                    ${isCurrentDay ? 'ring-2 ring-blue-400 bg-blue-500/10' : ''}
                  `}>
                    <span className={`
                      text-sm
                      ${calendarDay.isCurrentMonth ? 'text-white/60' : 'text-white/20'}
                      ${isCurrentDay ? 'text-blue-300 font-medium' : ''}
                    `}>
                      {calendarDay.day}
                    </span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-400" />
            <span className="text-sm text-white/60">Has Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-blue-400" />
            <span className="text-sm text-white/60">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
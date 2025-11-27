"use client"

import { EventDay } from "@/lib/events"
import { formatBytes, formatDate } from "@/lib/utils"
import { Calendar, Camera, HardDrive, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EventDayCardProps {
  eventDay: EventDay
}

export function EventDayCard({ eventDay }: EventDayCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm(`Delete all events from ${formatDate(eventDay.date)}?`)) return
    
    setIsDeleting(true)
    try {
      await fetch(`/api/events/${eventDay.date}`, { method: 'DELETE' })
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete:', error)
      setIsDeleting(false)
    }
  }

  const thumbnailUrl = eventDay.firstEvent 
    ? `/api/files/${eventDay.year}/${eventDay.month}/${eventDay.day}/${eventDay.firstEvent.filename}`
    : null

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/events/${eventDay.date}`}>
        <div className={cn(
          "group relative overflow-hidden rounded-xl glass glass-hover cursor-pointer",
          "transform transition-all duration-300",
          isDeleting && "opacity-50 pointer-events-none"
        )}>
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Thumbnail */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={`First event from ${eventDay.date}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Date overlay */}
            <div className="absolute top-4 left-4">
              <div className="glass px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{eventDay.date}</span>
                </div>
              </div>
            </div>

            {/* Delete button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              onClick={handleDelete}
              className="absolute top-4 right-4 p-2 glass glass-hover rounded-lg text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
              {formatDate(eventDay.date)}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  <span>{eventDay.eventCount} events</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatBytes(eventDay.totalSize)}</span>
                </div>
              </div>
            </div>

            {/* Hover indicator */}
            <motion.div
              className="h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
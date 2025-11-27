"use client"

import { SurveillanceEvent } from "@/lib/events"
import { formatTime } from "@/lib/utils"
import { Play, X, Maximize2, Download } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SurveillanceViewProps {
  events: SurveillanceEvent[]
  date: string
}

export function SurveillanceView({ events, date }: SurveillanceViewProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const getFileUrl = (filename: string) => {
    const [year, month, day] = date.split('-')
    return `/api/files/${year}/${month}/${day}/${filename}`
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.filename}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className="overflow-hidden rounded-xl glass glass-hover">
              {/* Image */}
              <div 
                className="relative aspect-video cursor-pointer overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
                onClick={() => setSelectedImage(getFileUrl(event.filename))}
              >
                <img
                  src={getFileUrl(event.filename)}
                  alt={`Event at ${formatTime(event.timestamp)}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Play button for videos */}
                {event.mp4Files.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedVideo(getFileUrl(event.mp4Files[0].filename))
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="p-4 rounded-full glass glass-hover">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {event.cameraId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                  {event.mp4Files.length > 0 && (
                    <div className="text-xs text-violet-400">
                      {event.mp4Files.length} video{event.mp4Files.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl overflow-hidden glass">
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
              
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 p-2 rounded-lg glass glass-hover text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full rounded-xl"
              />
              
              <div className="absolute -top-12 right-0 flex gap-2">
                <a
                  href={selectedImage}
                  download
                  className="p-2 rounded-lg glass glass-hover text-white"
                >
                  <Download className="w-6 h-6" />
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-lg glass glass-hover text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
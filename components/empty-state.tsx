"use client"

import { Shield, Camera } from "lucide-react"
import { motion } from "framer-motion"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
          <Shield className="w-16 h-16 text-violet-400" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center"
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white mb-4"
      >
        No Surveillance Events
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md"
      >
        No recorded events found. Events will appear here once your surveillance system captures activity.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex gap-4"
      >
        <div className="px-4 py-2 rounded-lg glass text-sm text-muted-foreground">
          Waiting for events...
        </div>
      </motion.div>
    </div>
  )
}
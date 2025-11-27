"use client"

import { Shield, Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-all duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Surveillance
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Events
            </Link>
            <Link 
              href="/analytics" 
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <Link 
              href="/settings" 
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg glass glass-hover"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link 
                href="/" 
                className="block px-4 py-2 rounded-lg glass glass-hover text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                href="/analytics" 
                className="block px-4 py-2 rounded-lg glass glass-hover text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                href="/settings" 
                className="block px-4 py-2 rounded-lg glass glass-hover text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
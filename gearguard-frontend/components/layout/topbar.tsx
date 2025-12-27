"use client"

import { motion } from "framer-motion"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Topbar() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-64 right-0 h-16 glass border-b border-border/50 flex items-center justify-between px-6 z-30"
    >
      <div className="flex items-center space-x-4 flex-1">
        {showSearch ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search equipment, requests..."
              className="bg-background/50"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </motion.div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
        </Button>
      </div>
    </motion.header>
  )
}

"use client"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Topbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="pt-16 p-6 min-h-screen"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

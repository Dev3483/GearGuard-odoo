"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useSidebar } from "@/context/sidebar-context"
import { motion } from "framer-motion"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <motion.main
          className="flex-1 p-6 pt-20 transition-all duration-300 ease-in-out"
          initial={false}
          animate={{ marginLeft: collapsed ? 80 : 256 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

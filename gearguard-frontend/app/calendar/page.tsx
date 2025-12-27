"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and view preventive maintenance tasks</p>
        </div>

        {/* Coming Soon Placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-12 glass text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Calendar View Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              The preventive maintenance calendar feature is under development
            </p>
            <Badge className="bg-primary/20 text-primary">In Development</Badge>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

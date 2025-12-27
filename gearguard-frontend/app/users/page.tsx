"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>

        {/* Redirect Message */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-12 glass text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-muted-foreground mb-4">
              Please visit the Admin Dashboard to manage users and their roles
            </p>
            <Badge className="bg-primary/20 text-primary">Admin Dashboard</Badge>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

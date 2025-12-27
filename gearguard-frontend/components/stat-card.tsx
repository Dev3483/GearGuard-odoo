"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
  delay?: number
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-6 glass-hover">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
            {trend && (
              <p
                className={cn("text-xs mt-2", trend.isPositive ? "text-success" : "text-destructive")}
              >{`${trend.isPositive ? "+" : ""}${trend.value}% from last month`}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-gradient-to-br", `from-${color} to-${color}/50`)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

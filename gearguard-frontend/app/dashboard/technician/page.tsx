"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Request {
  _id: string
  subject: string
  description?: string
  stage: "new" | "in_progress" | "repaired" | "scrap"
  urgency: "low" | "normal" | "high"
  type: "corrective" | "preventive"
  scheduledDate?: string
  equipment?: { name: string; _id: string }
  requester?: { name: string; _id: string }
  createdAt: string
  isOverdue?: boolean
}

const stages = [
  { id: "new", title: "New", color: "blue" },
  { id: "in_progress", title: "In Progress", color: "warning" },
  { id: "repaired", title: "Repaired", color: "success" },
  { id: "scrap", title: "Scrap", color: "destructive" },
]

const urgencyColors = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-destructive",
}

export default function TechnicianDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/requests/assigned")
      setRequests(response.data.data || response.data || [])
    } catch (error: any) {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (requestId: string, newStage: string) => {
    try {
      await axios.patch(`/requests/${requestId}/stage`, { stage: newStage })

      setRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, stage: newStage as any } : req)))

      toast.success("Request updated successfully")
    } catch (error: any) {
      toast.error("Failed to update request")
    }
  }

  const handleDragStart = (e: React.DragEvent, requestId: string) => {
    setDraggedItem(requestId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    if (draggedItem) {
      handleStageChange(draggedItem, newStage)
      setDraggedItem(null)
    }
  }

  const stats = {
    total: requests.length,
    inProgress: requests.filter((r) => r.stage === "in_progress").length,
    completed: requests.filter((r) => r.stage === "repaired").length,
    overdue: requests.filter((r) => r.isOverdue || (r.scheduledDate && new Date(r.scheduledDate) < new Date() && r.stage !== "repaired")).length,
  }

  const getRequestsByStage = (stage: string) => requests.filter((req) => req.stage === stage)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Workload Board</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned maintenance tasks</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Assigned" value={stats.total} icon={ClipboardList} delay={0} />
            <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="warning" delay={0.1} />
            <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="success" delay={0.2} />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="destructive" delay={0.3} />
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stage, stageIndex) => {
              const stageRequests = getRequestsByStage(stage.id)

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stageIndex * 0.1 }}
                  className="flex flex-col"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{stage.title}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          stage.color === "blue" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                          stage.color === "warning" && "bg-warning/20 text-warning-foreground border-warning/30",
                          stage.color === "success" && "bg-success/20 text-success-foreground border-success/30",
                          stage.color === "destructive" &&
                            "bg-destructive/20 text-destructive-foreground border-destructive/30",
                        )}
                      >
                        {stageRequests.length}
                      </Badge>
                    </div>
                    <div className={cn("h-1 rounded-full", `bg-${stage.color}`)} />
                  </div>

                  <div
                    className="flex-1 space-y-3 min-h-[400px] p-2 rounded-lg bg-muted/20"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    {stageRequests.map((request, index) => {
                      const isOverdue = request.isOverdue || (request.scheduledDate && new Date(request.scheduledDate) < new Date() && request.stage !== "repaired")

                      return (
                        <motion.div
                          key={request._id}
                          draggable
                          onDragStart={(e:any) => handleDragStart(e, request._id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className={cn("cursor-move", draggedItem === request._id && "opacity-50")}
                        >
                          <Card
                            className={cn(
                              "p-4 glass-hover",
                              isOverdue && stage.id !== "repaired" && "border-destructive/50 animate-pulse-soft",
                            )}
                          >
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-1">{request.subject}</h4>
                                {request.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
                                )}
                              </div>

                              {request.equipment && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Equipment:</span> {request.equipment.name}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                                <span className={cn("font-medium", urgencyColors[request.urgency || "normal"])}>
                                  {(request.urgency || "normal").toUpperCase()}
                                </span>
                                {request.scheduledDate && (
                                  <span className={cn(isOverdue && "text-destructive font-semibold")}>
                                    {format(new Date(request.scheduledDate), "MMM dd")}
                                  </span>
                                )}
                              </div>

                              {/* Mobile: Stage selector */}
                              <div className="lg:hidden">
                                <Select
                                  value={request.stage}
                                  onValueChange={(value) => handleStageChange(request._id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stages.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}

                    {stageRequests.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No requests
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

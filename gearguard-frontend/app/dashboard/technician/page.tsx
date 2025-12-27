"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RequestCard } from "@/components/request-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Search } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ChatDrawer } from "@/components/chat-drawer"

interface Request {
  _id: string
  subject: string
  description?: string
  stage: "new" | "in_progress" | "repaired" | "scrap"
  urgency: "low" | "normal" | "high"
  type: "corrective" | "preventive"
  scheduledDate?: string
  equipment?: { name: string; _id: string }
  technician?: { name: string; _id: string }
  createdAt: string
  isOverdue?: boolean
}

const COLUMNS = [
  { id: "new", title: "New", color: "text-blue-500 border-blue-200", bg: "bg-blue-50/50" },
  { id: "in_progress", title: "In Progress", color: "text-amber-500 border-amber-200", bg: "bg-amber-50/50" },
  { id: "repaired", title: "Completed", color: "text-green-500 border-green-200", bg: "bg-green-50/50" },
  { id: "scrap", title: "Scrapped", color: "text-red-500 border-red-200", bg: "bg-red-50/50" },
] as const

export default function TechnicianDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [selectedChatRequest, setSelectedChatRequest] = useState<{ id: string; subject: string } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr && userStr !== "undefined") {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // For technicians, we use the "assigned" endpoint
      const response = await axios.get("/requests/assigned")
      setRequests(response.data.data || response.data || [])
    } catch (error: any) {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, newStage: string) => {
    try {
      await axios.patch(`/requests/${requestId}/stage`, { stage: newStage })
      toast.success(`Moved to ${newStage.replace("_", " ")}`)
      setRequests((prev) => prev.map((r) => (r._id === requestId ? { ...r, stage: newStage as any } : r)))
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("requestId", id)
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    const requestId = e.dataTransfer.getData("requestId")
    setDraggedItem(null)
    if (requestId) {
      handleStatusUpdate(requestId, newStage)
    }
  }

  const filteredRequests = requests.filter((request) =>
    request.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.stage === "new").length,
    inProgress: requests.filter((r) => r.stage === "in_progress").length,
    completed: requests.filter((r) => r.stage === "repaired").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Technician Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your assigned maintenance tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <StatCard title="Total Assigned" value={stats.total} icon={ClipboardList} delay={0} />
            <StatCard title="Pending" value={stats.pending} icon={AlertTriangle} color="destructive" delay={0.1} />
            <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="warning" delay={0.2} />
            <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="success" delay={0.3} />
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-x-auto pb-4">
          <div className="flex h-full gap-6 min-w-max md:min-w-full">
            {COLUMNS.map((column) => {
              const columnRequests = filteredRequests.filter((r) => r.stage === column.id)
              return (
                <div
                  key={column.id}
                  className="w-[300px] md:flex-1 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className={cn("flex items-center justify-between p-3 rounded-t-xl border-b-2 bg-card", column.color)}>
                    <h3 className="font-semibold">{column.title}</h3>
                    <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border", column.color)}>
                      {columnRequests.length}
                    </div>
                  </div>

                  <div className={cn(
                    "flex-1 p-3 space-y-3 overflow-y-auto rounded-b-xl border border-t-0 bg-muted/10 transition-colors duration-200", 
                    draggedItem && "bg-muted/30 border-dashed border-primary/20"
                  )}>
                    <AnimatePresence mode="popLayout">
                      {columnRequests.map((request) => (
                        <motion.div
                          key={request._id}
                          layout
                          draggable
                          onDragStart={(e:any) => handleDragStart(e, request._id)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative group cursor-grab active:cursor-grabbing">
                            <div onClick={() => setSelectedChatRequest({ id: request._id, subject: request.subject })}>
                              <RequestCard request={request} />
                            </div>
                            
                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {column.id === 'new' && (
                                <Button
                                  size="sm"
                                  className="w-full h-8 text-xs"
                                  onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                                >
                                  Start Work
                                </Button>
                              )}
                              {column.id === 'in_progress' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleStatusUpdate(request._id, 'repaired')}
                                  >
                                    Finish
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() => handleStatusUpdate(request._id, 'scrap')}
                                  >
                                    Scrap
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {!loading && columnRequests.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-muted-foreground/30 text-sm italic border-2 border-dashed border-muted/20 rounded-lg">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ChatDrawer 
        requestId={selectedChatRequest?.id || null}
        requestSubject={selectedChatRequest?.subject || ""}
        isOpen={!!selectedChatRequest}
        onClose={() => setSelectedChatRequest(null)}
        currentUserId={currentUser?.id || currentUser?._id || ""}
      />
    </DashboardLayout>
  )
}

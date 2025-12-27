"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RequestCard } from "@/components/request-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Search, Filter } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { ChatDrawer } from "@/components/chat-drawer"

interface Request {
    _id: string
    subject: string
    stage: "new" | "in_progress" | "repaired" | "scrap"
    type: "corrective" | "preventive"
    urgency: "low" | "normal" | "high"
    scheduledDate?: string
    equipment?: { name: string; _id: string }
    technician?: { name: string; _id: string }
    createdAt: string
    isOverdue?: boolean
}

const COLUMNS = [
    { id: "new", title: "New", color: "text-blue-500 border-blue-200", bg: "bg-blue-50/50" },
    { id: "in_progress", title: "In Progress", color: "text-amber-500 border-amber-200", bg: "bg-amber-50/50" },
    { id: "repaired", title: "Repaired", color: "text-green-500 border-green-200", bg: "bg-green-50/50" },
    { id: "scrap", title: "Scrap", color: "text-red-500 border-red-200", bg: "bg-red-50/50" },
] as const

export default function TechnicianDashboard() {
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await axios.get("/requests/my")
            setRequests(response.data.data || response.data || [])
        } catch (error: any) {
            toast.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
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

const stages = [
  { id: "new", title: "New Requests", color: "blue" },
  { id: "in_progress", title: "In Progress", color: "warning" },
  { id: "repaired", title: "Completed", color: "success" },
  { id: "scrap", title: "Scrapped", color: "destructive" },
]

const urgencyColors = {
  low: "text-blue-500",
  normal: "text-gray-500",
  high: "text-red-500",
}

export default function TechnicianDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  
  const [selectedChatRequest, setSelectedChatRequest] = useState<{ id: string; subject: string } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get user from local storage safely
    const userStr = localStorage.getItem("user")
    if (userStr && userStr !== "undefined") {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
  }, [])

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

    const handleStatusUpdate = async (requestId: string, newStage: string) => {
        try {
            await axios.patch(`/requests/${requestId}/stage`, { stage: newStage })
            toast.success("Status updated")
            fetchData()
        } catch (error) {
            toast.error("Failed to update status")
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage your assigned maintenance tasks</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 glass"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
                        <StatCard title="Total Assigned" value={stats.total} icon={ClipboardList} delay={0} />
                        <StatCard title="Pending" value={stats.pending} icon={AlertTriangle} color="destructive" delay={0.1} />
                        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="warning" delay={0.2} />
                        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="success" delay={0.3} />
                    </div>
                )}

                {/* Kanban Board (Read-Only / No Drag) */}
                <div className="flex-1 min-h-0 overflow-x-auto pb-4">
                    {loading ? (
                        <div className="flex gap-6 h-full">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex-1 min-w-[300px]">
                                    <Skeleton className="h-full w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full gap-6">
                            {COLUMNS.map((column) => (
                                <div key={column.id} className="flex-1 min-w-[300px] flex flex-col">
                                    <div className={cn("flex items-center justify-between p-3 rounded-t-xl border-b-2 bg-card", column.color)}>
                                        <h3 className="font-semibold">{column.title}</h3>
                                        <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border", column.color)}>
                                            {filteredRequests.filter(r => r.stage === column.id).length}
                                        </div>
                                    </div>

                                    <div className={cn("flex-1 p-3 space-y-3 overflow-y-auto rounded-b-xl border border-t-0 bg-muted/20", column.bg)}>
                                        {filteredRequests
                                            .filter(r => r.stage === column.id)
                                            .map((request, index) => (
                                                <motion.div
                                                    key={request._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="relative group">
                                                        <RequestCard request={request} />
                                                        {/* Quick Actions overlay on hover if needed, or simple buttons */}
                                                        {column.id === 'new' && (
                                                            <Button
                                                                size="sm"
                                                                className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                                                            >
                                                                Start Work
                                                            </Button>
                                                        )}
                                                        {column.id === 'in_progress' && (
                                                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleStatusUpdate(request._id, 'repaired')}
                                                                >
                                                                    Repair
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="flex-1"
                                                                    onClick={() => handleStatusUpdate(request._id, 'scrap')}
                                                                >
                                                                    Scrap
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        {filteredRequests.filter(r => r.stage === column.id).length === 0 && (
                                            <div className="h-24 flex items-center justify-center text-muted-foreground/50 text-sm italic border-2 border-dashed border-muted rounded-lg">
                                                No tasks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
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
                          <div onClick={() => setSelectedChatRequest({ id: request._id, subject: request.subject })}>
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
                          </div>
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

      <ChatDrawer 
        requestId={selectedChatRequest?.id || null}
        requestSubject={selectedChatRequest?.subject || ""}
        isOpen={!!selectedChatRequest}
        onClose={() => setSelectedChatRequest(null)}
        currentUserId={currentUser?.id}
      />
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RequestCard } from "@/components/request-card"
import { KanbanBoard } from "@/components/kanban-board"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List as ListIcon, Search, Filter, Plus, ClipboardList, RefreshCw, Kanban } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label" // Added Label import

interface Request {
  _id: string
  subject: string
  stage: "new" | "in_progress" | "repaired" | "scrap"
  type: "corrective" | "preventive"
  scheduledDate?: string
  equipment?: { name: string; _id: string }
  technician?: { name: string; _id: string }
  createdAt: string
  isOverdue?: boolean
}

function RequestsContent() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [view, setView] = useState<"grid" | "kanban">("grid")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      // Don't set loading true if simple refresh to avoid flicker? 
      // Actually, better to keep it for now or check if requests.length === 0
      if (requests.length === 0) setLoading(true)

      const response = await axios.get("/requests")
      // Handle standardized response structure: { success: true, message: '', data: { requests: [], ... } }
      setRequests(response.data?.data?.requests || response.data?.requests || [])
    } catch (error: any) {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = stageFilter === "all" || request.stage === stageFilter
    return matchesSearch && matchesStage
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Requests</h1>
            <p className="text-muted-foreground mt-1">View and manage all maintenance requests</p>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="hidden md:flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
              className="h-8"
            >
              <Kanban className="h-4 w-4 mr-2" />
              Board
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full md:w-48 glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="repaired">Repaired</SelectItem>
              <SelectItem value="scrap">Scrap</SelectItem>
            </SelectContent>
          </Select>
        </div>




        {/* Content Area - Responsive height for Kanban */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 glass rounded-lg">
              <p className="text-muted-foreground">No requests found</p>
            </div>
          ) : view === "kanban" ? (
            <KanbanBoard
              requests={filteredRequests}
              onUpdate={fetchRequests}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 overflow-y-auto max-h-full">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RequestCard request={request} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestsContent />
    </Suspense>
  )
}

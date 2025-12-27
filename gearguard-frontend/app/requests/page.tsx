"use client"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RequestCard } from "@/components/request-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Request {
  _id: string
  subject: string
  stage: "new" | "in_progress" | "repaired" | "scrap"
  type: "corrective" | "preventive"
  scheduledDate?: string
  equipment?: { name: string; _id: string }
  technician?: { name: string; _id: string }
  createdAt: string
}

function RequestsContent() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">All Requests</h1>
          <p className="text-muted-foreground mt-1">View and manage all maintenance requests</p>
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

        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {!loading && filteredRequests.length === 0 && (
          <div className="text-center py-12 glass rounded-lg">
            <p className="text-muted-foreground">No requests found</p>
          </div>
        )}
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

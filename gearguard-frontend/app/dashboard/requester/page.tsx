"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RequestCard } from "@/components/request-card"
import { ChatDrawer } from "@/components/chat-drawer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Equipment {
  _id: string
  name: string
  team?: { _id: string; name: string; defaultTechnician?: { _id: string; name: string } }
}

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

export default function RequesterDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    equipmentId: "",
    urgency: "normal",
    type: "corrective",
    scheduledDate: "",
    duration: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, equipmentRes] = await Promise.all([axios.get("/requests/my"), axios.get("/equipment")])

      setRequests(requestsRes.data.data || requestsRes.data || [])
      setEquipment(equipmentRes.data?.data?.equipment || equipmentRes.data?.data || equipmentRes.data || [])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleEquipmentChange = async (equipmentId: string) => {
    setFormData((prev) => ({ ...prev, equipmentId }))

    // Auto-fill team and technician
    const selectedEquipment = equipment.find((e) => e._id === equipmentId)
    if (selectedEquipment?.team) {
      // Equipment will auto-assign team and technician via backend
      toast.success(`Team and technician will be auto-assigned`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post("/requests", {
        ...formData,
        equipment: formData.equipmentId,
      })

      toast.success("Request created successfully!")
      setDialogOpen(false)
      setFormData({
        subject: "",
        description: "",
        equipmentId: "",
        urgency: "normal",
        type: "corrective",
        scheduledDate: "",
        duration: 0,
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create request")
    } finally {
      setSubmitting(false)
    }
  }

  const stats = {
    total: requests.length,
    inProgress: requests.filter((r) => r.stage === "in_progress").length,
    completed: requests.filter((r) => r.stage === "repaired").length,
    overdue: requests.filter((r) => r.isOverdue || (r.scheduledDate && new Date(r.scheduledDate) < new Date() && r.stage !== "repaired")).length,
  }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="text-muted-foreground mt-1">Track and manage your maintenance requests</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Maintenance Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of the issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select value={formData.equipmentId} onValueChange={handleEquipmentChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Scheduled Time</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="duration">Duration (Hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g. 2"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
            <StatCard title="Total Requests" value={stats.total} icon={ClipboardList} delay={0} />
            <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="warning" delay={0.1} />
            <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="success" delay={0.2} />
            <StatCard title="Overdue" value={stats.overdue} icon={XCircle} color="destructive" delay={0.3} />
          </div>
        )}

        {/* Requests Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="repaired">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass rounded-lg"
              >
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground mb-4">Create your first maintenance request to get started</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Request
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RequestCard 
                      request={request} 
                      onClick={() => setSelectedChatRequest({ id: request._id, subject: request.subject })}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {["new", "in_progress", "repaired"].map((stage) => (
            <TabsContent key={stage} value={stage} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests
                  .filter((r) => r.stage === stage)
                  .map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <RequestCard 
                        request={request}
                        onClick={() => setSelectedChatRequest({ id: request._id, subject: request.subject })}
                      />
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Chat Drawer */}
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

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RequestCard } from "@/components/request-card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Users, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Equipment {
  _id: string
  name: string
  department: string
  status: string
  assignedTeam?: { name: string }
}

interface Team {
  _id: string
  name: string
  members: any[]
  defaultTechnician?: { name: string }
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

import { ChatDrawer } from "@/components/chat-drawer"

export default function ManagerDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

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
    fetchData()
  }, [])
  const fetchData = async () => {
    try {
      const [equipmentRes, teamsRes, requestsRes] = await Promise.all([
        axios.get("/equipment"),
        axios.get("/teams"),
        axios.get("/requests"),
      ])

      setEquipment(equipmentRes.data?.data?.equipment || equipmentRes.data?.data || equipmentRes.data || [])
      setTeams(teamsRes.data?.data || teamsRes.data || [])
      setRequests(requestsRes.data?.data?.requests || requestsRes.data?.data || requestsRes.data || [])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    equipment: equipment.length,
    teams: teams.length,
    requestsToday: requests.filter((r) => {
      const today = new Date().toDateString()
      return new Date(r.createdAt).toDateString() === today
    }).length,
    overdue: requests.filter((r) => r.isOverdue || (r.scheduledDate && new Date(r.scheduledDate) < new Date() && r.stage !== "repaired")).length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Control Center</h1>
          <p className="text-muted-foreground mt-1">Overview of all operations and resources</p>
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
            <StatCard title="Equipment" value={stats.equipment} icon={Package} delay={0} />
            <StatCard title="Teams" value={stats.teams} icon={Users} color="accent" delay={0.1} />
            <StatCard
              title="Requests Today"
              value={stats.requestsToday}
              icon={TrendingUp}
              color="success"
              delay={0.2}
            />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="destructive" delay={0.3} />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-6 glass">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Recent Requests</h3>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {requests.slice(0, 5).map((request) => (
                      <div 
                        key={request._id} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedChatRequest({ id: request._id, subject: request.subject })}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{request.subject}</p>
                          <p className="text-xs text-muted-foreground">{request.equipment?.name}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            request.stage === "new"
                              ? "bg-blue-500/20 text-blue-400"
                              : request.stage === "in_progress"
                                ? "bg-warning/20 text-warning-foreground"
                                : request.stage === "repaired"
                                  ? "bg-success/20 text-success-foreground"
                                  : "bg-destructive/20 text-destructive"
                          }
                        >
                          {request.stage.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
{/* ... Equipment Status Card ... */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-6 glass">
                  <h3 className="font-semibold text-lg mb-4">Equipment Status</h3>
                  <div className="space-y-3">
                    {[
                      {
                        status: "active",
                        display: "Operational",
                        count: equipment.filter((e) => e.status === "active").length,
                        color: "success",
                      },
                      {
                        status: "scrapped",
                        display: "Scrapped",
                        count: equipment.filter((e) => e.status === "scrapped").length,
                        color: "destructive",
                      },
                      {
                        status: "archived",
                        display: "Archived",
                        count: equipment.filter((e) => e.status === "archived").length,
                        color: "warning",
                      },
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="capitalize font-medium">{item.display}</span>
                        <Badge
                          className={
                            item.color === "success"
                              ? "bg-success/20 text-success-foreground"
                              : item.color === "warning"
                                ? "bg-warning/20 text-warning-foreground"
                                : "bg-destructive/20 text-destructive"
                          }
                        >
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="p-4 glass-hover cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.department}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "active"
                              ? "bg-success/20 text-success-foreground"
                              : item.status === "archived"
                                ? "bg-warning/20 text-warning-foreground"
                                : "bg-destructive/20 text-destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      {item.assignedTeam && <p className="text-xs text-muted-foreground">Team: {item.assignedTeam.name}</p>}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, index) => (
                  <motion.div
                    key={team._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="p-5 glass-hover cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{team.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="bg-accent/20 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-accent-foreground" />
                        </div>
                      </div>
                      {team.defaultTechnician && (
                        <p className="text-xs text-muted-foreground">Lead: {team.defaultTechnician.name}</p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
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
        </Tabs>
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

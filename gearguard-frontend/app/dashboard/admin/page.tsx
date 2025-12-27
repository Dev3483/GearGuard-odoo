"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Package, ClipboardList, ShieldCheck, Plus, Trash2 } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface SystemStats {
  users: number
  equipment: number
  requests: number
  teams: number
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats>({ users: 0, equipment: 0, requests: 0, teams: 0 })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "requester",
  })

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

      // Note: In a real app, there would be a /users endpoint for admins
      // For now, we'll simulate this
      setStats({
        users: 4, // Simulated - would come from backend
        equipment: (equipmentRes.data?.data?.equipment || equipmentRes.data?.data || equipmentRes.data || []).length,
        requests: (requestsRes.data?.data?.requests || requestsRes.data?.data || requestsRes.data || []).length,
        teams: (teamsRes.data?.data || teamsRes.data?.data || teamsRes.data || []).length,
      })

      // Simulated users for display
      setUsers([
        { _id: "1", name: "Admin User", email: "admin@gearguard.com", role: "admin" },
        { _id: "2", name: "Manager User", email: "manager@gearguard.com", role: "manager" },
        { _id: "3", name: "Tech User", email: "tech@gearguard.com", role: "technician" },
        { _id: "4", name: "Requester User", email: "requester@gearguard.com", role: "requester" },
      ])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post("/auth/register", formData)

      toast.success("User created successfully!")
      setDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "requester",
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  const roleColors: Record<string, string> = {
    admin: "bg-destructive/20 text-destructive border-destructive/30",
    manager: "bg-warning/20 text-warning-foreground border-warning/30",
    technician: "bg-primary/20 text-primary border-primary/30",
    requester: "bg-accent/20 text-accent-foreground border-accent/30",
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">System Overview</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and system-wide settings</p>
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
            <StatCard title="Total Users" value={stats.users} icon={Users} delay={0} />
            <StatCard title="Equipment" value={stats.equipment} icon={Package} color="accent" delay={0.1} />
            <StatCard title="Total Requests" value={stats.requests} icon={ClipboardList} color="primary" delay={0.2} />
            <StatCard title="Teams" value={stats.teams} icon={ShieldCheck} color="success" delay={0.3} />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Users & Roles</h3>
                <p className="text-sm text-muted-foreground">Manage system users and their permissions</p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="requester">Requester</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Creating..." : "Create User"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <Card className="p-4 glass-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div
                            className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg",
                              user.role === "admin" && "bg-destructive/20 text-destructive",
                              user.role === "manager" && "bg-warning/20 text-warning-foreground",
                              user.role === "technician" && "bg-primary/20 text-primary",
                              user.role === "requester" && "bg-accent/20 text-accent-foreground",
                            )}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={cn("uppercase font-semibold", roleColors[user.role])}>
                            {user.role}
                          </Badge>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 glass">
                  <h3 className="font-semibold text-lg mb-4">Database Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Total Equipment</span>
                      <Badge variant="outline">{stats.equipment}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Total Teams</span>
                      <Badge variant="outline">{stats.teams}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Total Requests</span>
                      <Badge variant="outline">{stats.requests}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Total Users</span>
                      <Badge variant="outline">{stats.users}</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6 glass">
                  <h3 className="font-semibold text-lg mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">API Status</span>
                        <Badge className="bg-success/20 text-success-foreground">Online</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-success to-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Database</span>
                        <Badge className="bg-success/20 text-success-foreground">Connected</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "98%" }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-success to-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Server Load</span>
                        <Badge className="bg-primary/20 text-primary">Normal</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "45%" }}
                          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

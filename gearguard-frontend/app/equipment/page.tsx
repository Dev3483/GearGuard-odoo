"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Search } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Equipment {
    _id: string
    name: string
    serialNumber: string
    department: string
    location: string
    status: string
    assignedTeam?: { _id: string; name: string }
}

interface Team {
    _id: string
    name: string
}

function EquipmentContent() {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        serialNumber: "",
        department: "",
        location: "",
        purchaseDate: "",
        status: "active",
        assignedTeam: "",
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [equipmentRes, teamsRes] = await Promise.all([axios.get("/equipment"), axios.get("/teams")])
            // Backend returns { success: true, data: { equipment: [], totalPages... } } or just data if I didn't wrap properly?
            // My backend wrapper returns: { success: true, message: '...', data: { equipment: [...], ... } } for getEquipment
            // Wait, getEquipment returns { equipment, totalPages... } in data.
            setEquipment(equipmentRes.data?.data?.equipment || equipmentRes.data?.equipment || [])
            setTeams(teamsRes.data?.data || teamsRes.data || [])
        } catch (error: any) {
            toast.error("Failed to load equipment")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            await axios.post("/equipment", formData)

            toast.success("Equipment added successfully!")
            setDialogOpen(false)
            setFormData({
                name: "",
                serialNumber: "",
                department: "",
                location: "",
                purchaseDate: "",
                status: "active",
                assignedTeam: "",
            })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add equipment")
        } finally {
            setSubmitting(false)
        }
    }

    const filteredEquipment = equipment.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const statusColors: Record<string, string> = {
        active: "bg-success/20 text-success-foreground border-success/30",
        scrapped: "bg-destructive/20 text-destructive border-destructive/30",
        archived: "bg-muted text-muted-foreground border-border",
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Equipment Management</h1>
                        <p className="text-muted-foreground mt-1">Manage all equipment and their assignments</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Equipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Equipment</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Equipment Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="CNC Machine 01"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serialNumber">Serial Number</Label>
                                    <Input
                                        id="serialNumber"
                                        placeholder="SN-123456"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        placeholder="Manufacturing"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="Floor 1, Zone A"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                                    <Input
                                        id="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="scrapped">Scrapped</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="team">Assign Team</Label>
                                    <Select value={formData.assignedTeam} onValueChange={(value) => setFormData({ ...formData, assignedTeam: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team._id} value={team._id}>
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? "Adding..." : "Add Equipment"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search equipment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass"
                    />
                </div>

                {/* Equipment Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-40" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEquipment.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Card className="p-5 glass-hover cursor-pointer">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.department}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">SN: {item.serialNumber}</p>
                                                </div>
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Badge variant="outline" className={cn(statusColors[item.status] || statusColors.active)}>
                                                    {item.status}
                                                </Badge>

                                                {item.assignedTeam && (
                                                    <div className="text-xs text-muted-foreground">
                                                        <span className="font-medium">Team:</span> {item.assignedTeam.name}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    <span className="font-medium">Loc:</span> {item.location}
                                                </div>
                                            </div>
                                        </Card>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Equipment Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Name</Label>
                                                <p className="font-medium">{item.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Serial Number</Label>
                                                <p className="font-medium font-mono">{item.serialNumber}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Department</Label>
                                                <p>{item.department}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Location</Label>
                                                <p>{item.location}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Status</Label>
                                                <div className="mt-1"><Badge variant="outline" className={cn(statusColors[item.status])}>{item.status}</Badge></div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Assigned Team</Label>
                                                <p>{item.assignedTeam?.name || "Unassigned"}</p>
                                            </div>
                                            {/* We can access purchaseDate if it was fetched. The interface suggests it might be there. */}
                                            {/* If not in interface, we might need to add it to Equipment interface. But let's assume it's in data */}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default function EquipmentPage() {
    return (
        <Suspense fallback={null}>
            <EquipmentContent />
        </Suspense>
    )
}

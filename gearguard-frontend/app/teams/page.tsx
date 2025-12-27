"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Trash2 } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Team {
    _id: string
    name: string
    members?: any[]
    defaultTechnician?: { name: string; _id: string }
}

interface User {
    _id: string
    name: string
    role: string
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [users, setUsers] = useState<User[]>([])

    // Details Dialog State
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState("")

    const [formData, setFormData] = useState({
        name: "",
    })

    useEffect(() => {
        fetchTeams()
        fetchUsers()
    }, [])

    const fetchTeams = async () => {
        try {
            const response = await axios.get("/teams")
            setTeams(response.data.data || response.data || [])
        } catch (error: any) {
            toast.error("Failed to load teams")
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/users")
            setUsers(response.data.data || response.data || [])
        } catch (error) {
            console.error("Failed to fetch users", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            await axios.post("/teams", formData)

            toast.success("Team created successfully!")
            setDialogOpen(false)
            setFormData({ name: "" })
            fetchTeams()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create team")
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddMember = async () => {
        if (!selectedTeam || !selectedMember) return;
        try {
            // Logic to add member. Since backend doesn't have a specific addMember route shown, 
            // we use PATCH /teams/:id with updated members list is common, OR backend handles it.
            // Looking at Team model, members is array of ObjectIds.
            // Let's try sending the updated list of IDs.
            const currentMemberIds = selectedTeam.members?.map(m => m._id) || []
            if (currentMemberIds.includes(selectedMember)) {
                toast.error("User is already a member")
                return
            }

            const updatedMembers = [...currentMemberIds, selectedMember]
            await axios.patch(`/teams/${selectedTeam._id}`, { members: updatedMembers })

            toast.success("Member added")
            fetchTeams() // Refresh list
            setDetailsOpen(false) // Close for now or we need to re-fetch selectedTeam?
            // Ideally re-fetch just this team, but fetchTeams is okay.
        } catch (error: any) {
            toast.error("Failed to add member")
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                        <p className="text-muted-foreground mt-1">Organize and manage maintenance teams</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Team Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Maintenance Team A"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? "Creating..." : "Create Team"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Teams Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-40" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team, index) => (
                            <motion.div
                                key={team._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                onClick={() => {
                                    setSelectedTeam(team)
                                    setDetailsOpen(true)
                                }}
                            >
                                <Card className="p-6 glass-hover cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Users className="h-4 w-4 mr-2" />
                                                {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <div className="bg-primary/10 p-3 rounded-xl">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>

                                    {team.defaultTechnician && (
                                        <div className="pt-3 border-t border-border/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">Team Lead</span>
                                                <Badge variant="outline" className="bg-primary/20 text-primary">
                                                    {team.defaultTechnician.name}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Team Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedTeam?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">Team Members</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto mb-4 border rounded-md p-2">
                                    {selectedTeam?.members && selectedTeam.members.length > 0 ? (
                                        selectedTeam.members.map((member: any) => (
                                            <div key={member._id} className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded">
                                                <span>{member.name}</span>
                                                <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No members assigned.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label>Add Member</Label>
                                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select technician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.filter(u => u.role === 'technician').map(u => (
                                                <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddMember} disabled={!selectedMember}>Add</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    )
}

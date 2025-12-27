"use client"

import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"

interface RequestFormProps {
    open: boolean
    onClose: () => void
    request?: any
    equipment: any[]
    teams: any[]
    members: any[]
    onSubmit: (data: any) => void
    defaultDate?: string | null
    isLoading?: boolean
    isEdit?: boolean
}

export default function RequestForm({
    open,
    onClose,
    request,
    equipment,
    teams,
    onSubmit,
    defaultDate,
    isLoading,
    isEdit
}: RequestFormProps) {

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: "",
            description: "",
            equipment_id: "",
            team_id: "",
            priority: "Medium",
            status: "New",
            scheduled_date: defaultDate || ""
        }
    })

    useEffect(() => {
        if (open) {
            if (request) {
                reset({
                    title: request.title,
                    description: request.description,
                    equipment_id: request.equipment_id,
                    team_id: request.team_id,
                    priority: request.priority,
                    status: request.status,
                    scheduled_date: request.scheduled_date
                })
            } else {
                reset({
                    title: "",
                    description: "",
                    equipment_id: "",
                    team_id: "",
                    priority: "Medium",
                    status: "New",
                    scheduled_date: defaultDate || ""
                })
            }
        }
    }, [open, request, defaultDate, reset])

    const handleFormSubmit = (data: any) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Maintenance Request" : "New Maintenance Request"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" {...register("title", { required: true })} placeholder="Request title" />
                        {errors.title && <span className="text-xs text-destructive">Title is required</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Describe the issue or task" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="equipment">Equipment</Label>
                            <Select onValueChange={(v) => setValue("equipment_id", v)} defaultValue={request?.equipment_id?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team">Team</Label>
                            <Select onValueChange={(v) => setValue("team_id", v)} defaultValue={request?.team_id?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select onValueChange={(v) => setValue("priority", v)} defaultValue={request?.priority || "Medium"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Scheduled Date</Label>
                            <Input type="date" id="scheduled_date" {...register("scheduled_date")} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Request"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

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
    open: boolean;
    onClose: () => void;
    request: any;
    equipment: any[];
    teams: any[];
    members: any[];
    onSubmit: (data: any) => void;
    defaultDate?: string | null;
    isLoading?: boolean;
    isEdit?: boolean;
    isDemoMode?: boolean;
}

export default function RequestForm({
    open,
    onClose,
    request,
    equipment,
    teams,
    members,
    onSubmit,
    defaultDate,
    isLoading = false,
    isEdit = false,
    isDemoMode = false
}: RequestFormProps) {

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: "",
            description: "",
            equipment_id: "",
            team_id: "",
            priority: "Medium",
            status: "New",
            scheduled_date: defaultDate || "",
            equipment_category: "",
            department: ""
        }
    })

    // Watch equipment_id to auto-fill category and department
    const selectedEquipmentId = watch("equipment_id")

    // Auto-fill category and department when equipment is selected
    useEffect(() => {
        if (selectedEquipmentId && selectedEquipmentId !== "none") {
            const selectedEquipment = equipment.find(eq => eq.id.toString() === selectedEquipmentId)
            if (selectedEquipment) {
                if (selectedEquipment.category) {
                    setValue("equipment_category", selectedEquipment.category)
                }
                if (selectedEquipment.department) {
                    setValue("department", selectedEquipment.department)
                }
            }
        }
    }, [selectedEquipmentId, equipment, setValue])

    // Reset form when modal opens/closes or request changes
    useEffect(() => {
        if (open) {
            if (request) {
                // Edit mode - populate with request data
                reset({
                    title: request.title || "",
                    description: request.description || "",
                    equipment_id: request.equipment_id?.toString() || "",
                    team_id: request.team_id?.toString() || "",
                    priority: request.priority || "Medium",
                    status: request.status || "New",
                    scheduled_date: request.scheduled_date || defaultDate || "",
                    equipment_category: request.equipment_category || "",
                    department: request.department || ""
                })
            } else {
                // New request mode - set defaults
                reset({
                    title: "",
                    description: "",
                    equipment_id: "",
                    team_id: "",
                    priority: "Medium",
                    status: "New",
                    scheduled_date: defaultDate || "",
                    equipment_category: "",
                    department: ""
                })
            }
        }
    }, [open, request, defaultDate, reset])

    const handleFormSubmit = (data: any) => {
        // Parse numeric fields
        const formattedData = {
            ...data,
            equipment_id: data.equipment_id && data.equipment_id !== "none" ? parseInt(data.equipment_id) : null,
            team_id: data.team_id && data.team_id !== "none" ? parseInt(data.team_id) : null
        }
        onSubmit(formattedData)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Maintenance Request" : "New Maintenance Request"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {isDemoMode && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                            <span className="font-medium">Note:</span> Using demonstration data. Changes will be saved locally only.
                        </div>
                    )}

                    {/* Title and Date Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                {...register("title", { required: "Title is required" })}
                                placeholder="Enter maintenance title"
                            />
                            {errors.title && (
                                <span className="text-xs text-destructive">{errors.title.message as string}</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                            <Input
                                id="scheduled_date"
                                type="date"
                                {...register("scheduled_date", { required: "Scheduled date is required" })}
                            />
                            {errors.scheduled_date && (
                                <span className="text-xs text-destructive">{errors.scheduled_date.message as string}</span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Describe the maintenance task"
                            rows={3}
                        />
                    </div>

                    {/* Equipment and Team Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="equipment_id">Equipment</Label>
                            <Select
                                onValueChange={(value) => setValue("equipment_id", value)}
                                value={watch("equipment_id")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No equipment</SelectItem>
                                    {equipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id.toString()}>
                                            {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team_id">Assigned Team</Label>
                            <Select
                                onValueChange={(value) => setValue("team_id", value)}
                                value={watch("team_id")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No team</SelectItem>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id.toString()}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Priority and Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                onValueChange={(value) => setValue("priority", value)}
                                value={watch("priority")}
                            >
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
                            <Label htmlFor="status">Status</Label>
                            <Select
                                onValueChange={(value) => setValue("status", value)}
                                value={watch("status")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">Scheduled</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Repaired">Completed</SelectItem>
                                    <SelectItem value="Scrap">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category and Department Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="equipment_category">Equipment Category</Label>
                            <Select
                                onValueChange={(value) => setValue("equipment_category", value)}
                                value={watch("equipment_category")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Machinery">Machinery</SelectItem>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="HVAC">HVAC</SelectItem>
                                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                                    <SelectItem value="Electrical">Electrical</SelectItem>
                                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                                    <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                                    <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select
                                onValueChange={(value) => setValue("department", value)}
                                value={watch("department")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="Facilities">Facilities</SelectItem>
                                    <SelectItem value="IT">IT</SelectItem>
                                    <SelectItem value="Logistics">Logistics</SelectItem>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : isEdit ? "Update Request" : "Create Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

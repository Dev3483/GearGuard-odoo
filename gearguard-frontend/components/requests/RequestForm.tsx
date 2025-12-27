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
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    equipment = [],
    teams = [],
    members = [],
    onSubmit,
    defaultDate,
    isLoading = false,
    isEdit = false,
    isDemoMode = false,
}: RequestFormProps) {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        equipment_id: '',
        equipment_category: '',
        team_id: '',
        priority: 'Medium',
        status: 'New',
        scheduled_date: '',
        department: '',
    });

    useEffect(() => {
        if (request) {
            setFormData({
                title: request.title || '',
                description: request.description || '',
                equipment_id: request.equipment_id?.toString() || '',
                equipment_category: request.equipment_category || '',
                team_id: request.team_id?.toString() || '',
                priority: request.priority || 'Medium',
                status: request.status || 'New',
                scheduled_date: request.scheduled_date || defaultDate || '',
                department: request.department || '',
            });
        } else if (defaultDate) {
            setFormData(prev => ({
                ...prev,
                scheduled_date: defaultDate,
            }));
        } else {
            // Reset form when opening for new request
            setFormData({
                title: '',
                description: '',
                equipment_id: '',
                equipment_category: '',
                team_id: '',
                priority: 'Medium',
                status: 'New',
                scheduled_date: '',
                department: '',
            });
        }
    }, [request, defaultDate, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill department and category if equipment is selected
        if (name === 'equipment_id' && value) {
            const selectedEquipment = equipment.find(eq => eq.id.toString() === value);
            if (selectedEquipment) {
                setFormData(prev => ({
                    ...prev,
                    equipment_id: value,
                    equipment_category: selectedEquipment.category || prev.equipment_category,
                    department: selectedEquipment.department || prev.department
                }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare the data
        const finalData = {
            ...formData,
            equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : null,
            team_id: formData.team_id ? parseInt(formData.team_id) : null,
        };

        onSubmit(finalData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Preventive Maintenance' : 'Schedule Preventive Maintenance'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isDemoMode && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                            <span className="font-medium">Note:</span> Using demonstration data. Changes will be saved locally only.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter maintenance title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                            <Input
                                id="scheduled_date"
                                name="scheduled_date"
                                type="date"
                                value={formData.scheduled_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Describe the issue or task" />
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter maintenance description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="equipment">Equipment</Label>
                            <Select onValueChange={(v) => setValue("equipment_id", v)} defaultValue={request?.equipment_id?.toString()}>
                            <Label htmlFor="equipment_id">Equipment</Label>
                            <Select
                                value={formData.equipment_id || "none"}
                                onValueChange={(value) => handleSelectChange('equipment_id', value === "none" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
                                    <SelectItem value="none">No equipment</SelectItem>
                                    {equipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id.toString()}>
                                            {eq.name} ({eq.serial_number || 'No SN'})
                                        </SelectItem>
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
                            <Label htmlFor="team_id">Assigned Team</Label>
                            <Select
                                value={formData.team_id || "none"}
                                onValueChange={(value) => handleSelectChange('team_id', value === "none" ? "" : value)}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select onValueChange={(v) => setValue("priority", v)} defaultValue={request?.priority || "Medium"}>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleSelectChange('priority', value)}
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
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
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

                    <div className="space-y-2">
                        <Label htmlFor="equipment_category">Equipment Category</Label>
                        <Select
                            value={formData.equipment_category || ""}
                            onValueChange={(value) => handleSelectChange('equipment_category', value)}
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
                            value={formData.department || ""}
                            onValueChange={(value) => handleSelectChange('department', value)}
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

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEdit ? 'Update Schedule' : 'Schedule Maintenance'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

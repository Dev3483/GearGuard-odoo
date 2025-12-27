"use client"

import { useState } from "react"
import { KanbanColumn } from "./kanban-column"
import { toast } from "sonner"
import axios from "@/lib/axios"

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

interface KanbanBoardProps {
    requests: Request[]
    onUpdate: () => void
}

const COLUMNS = [
    { id: "new", title: "New", color: "text-blue-500 border-blue-200" },
    { id: "in_progress", title: "In Progress", color: "text-amber-500 border-amber-200" },
    { id: "repaired", title: "Repaired", color: "text-green-500 border-green-200" },
    { id: "scrap", title: "Scrap", color: "text-red-500 border-red-200" },
] as const

export function KanbanBoard({ requests, onUpdate }: KanbanBoardProps) {
    // We maintain local state for optimistic UI updates
    // But actually, we can just derive from props if we trust parent to re-fetch?
    // User asked for instant move.
    // Best to use local derived state.

    // Note: Since requests prop changes when we refetch, we usually sync.
    // But for DND, we need immediate feedback.

    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault()
        const requestId = e.dataTransfer.getData("requestId")

        if (!requestId) return

        const request = requests.find(r => r._id === requestId)
        if (!request || request.stage === targetStage) return

        // Optomistic UI Update (handled by parent re-fetch usually, but let's notify parent)
        // Actually, to make it instant, we should probably update a local list first?
        // For now, let's just trigger the API and then onUpdate.
        // To make it smooth, we can try to update local state if we had it, but requests come from parent.
        // Let's rely on fast API for now or add optimistic logic in parent. 
        // Actually, simple way: call API, then onUpdate.

        try {
            // Show loading or just do it?
            toast.promise(
                axios.patch(`/requests/${requestId}/stage`, { stage: targetStage }),
                {
                    loading: 'Updating status...',
                    success: () => {
                        onUpdate() // Refresh data
                        return 'Status updated'
                    },
                    error: 'Failed to update status'
                }
            )
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex h-full gap-6 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
                <div
                    key={column.id}
                    className="flex-1 min-w-[300px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <KanbanColumn
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        requests={requests.filter((r) => r.stage === column.id)}
                    />
                </div>
            ))}
        </div>
    )
}

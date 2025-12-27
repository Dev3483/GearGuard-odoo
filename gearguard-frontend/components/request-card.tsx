"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertCircle, CheckCircle2, Clock, Timer, User, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Request {
    _id: string
    subject: string
    stage: "new" | "in_progress" | "repaired" | "scrap"
    type: "corrective" | "preventive"
    urgency?: "low" | "normal" | "high"
    scheduledDate?: string
    duration?: number
    equipment?: { name: string; _id: string }
    technician?: { name: string; _id: string }
    createdAt: string
    isOverdue?: boolean
}

interface RequestCardProps {
    request: Request
    onClick?: () => void
}

const stageColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-warning/20 text-warning-foreground border-warning/30",
    repaired: "bg-success/20 text-success-foreground border-success/30",
    scrap: "bg-destructive/20 text-destructive border-destructive/30",
}

const typeColors: Record<string, string> = {
    preventive: "text-muted-foreground",
    corrective: "text-destructive font-semibold",
}

export function RequestCard({ request, onClick }: RequestCardProps) {
    // Use backend computed logic or frontend logic. Backend sends isOverdue virtual.
    const isOverdue = request.isOverdue || (request.scheduledDate && new Date(request.scheduledDate) < new Date() && request.stage !== "repaired")

    return (
        <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Card
                className={cn(
                    "p-4 glass-hover cursor-pointer transition-all duration-300",
                    isOverdue && "border-destructive/50 animate-pulse-soft",
                )}
                onClick={onClick}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{request.subject}</h3>
                    </div>
                    <Badge className={cn("ml-2", stageColors[request.stage])}>{request.stage.replace("_", " ")}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                    {request.equipment && (
                        <div className="flex items-center text-muted-foreground">
                            <Package className="h-4 w-4 mr-2" />
                            <span>{request.equipment.name}</span>
                        </div>
                    )}

                    {request.technician && (
                        <div className="flex items-center text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            <span>{request.technician.name}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className={cn("flex items-center", typeColors[request.type])}>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium capitalize">{request.type}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            {request.scheduledDate && (
                                <span className={cn(isOverdue && "text-destructive font-semibold")}>
                                    {format(new Date(request.scheduledDate), "MMM dd, HH:mm")}
                                </span>
                            )}
                            {request.duration && request.duration > 0 && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {request.duration}h
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

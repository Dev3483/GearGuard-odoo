"use client"
import { RequestCard } from "@/components/request-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface KanbanColumnProps {
  id: string
  title: string
  requests: Request[]
  color: string
}

export function KanbanColumn({ id, title, requests, color }: KanbanColumnProps) {
    // We will implement DND logic in the Board wrapper. 
    // This column is just a visual container with a drop zone.
    // However, since I chose HTML5 DnD in plan to avoid deps (but see note below),
    // I will use standard standard `onDrop` etc if not using dnd-kit.
    // BUT, to make it "Wow" and smooth, I'll stick to simple standard React props
    // and let the parent handle the DnD context if I was using dnd-kit.
    // Wait, I said in plan "HTML5 Drag & Drop API".
    
    // Let's implement standard HTML5 listeners here or in parent?
    // Parent should handle "DragStart" and "Drop".
    // Column handles "DragOver".

  return (
    <div 
        className="flex flex-col h-full rounded-lg bg-muted/30 p-4 min-w-[300px]"
        onDragOver={(e) => {
            e.preventDefault() // Allow drop
        }}
        // onDrop is handled by parent passing a handler or here?
        // Let's put data-column-id on this div
        data-column-id={id}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge variant="outline" className={cn("bg-background", color)}>
          {requests.length}
        </Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[500px]">
        {requests.map((request) => (
           <div key={request._id} className="cursor-grab active:cursor-grabbing">
             {/* Wrap RequestCard to make it draggable */}
             <DraggableCard request={request} />
           </div>
        ))}
        {requests.length === 0 && (
            <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center p-8">
                <span className="text-muted-foreground/50 text-sm">Drop items here</span>
            </div>
        )}
      </div>
    </div>
  )
}

// Wrapper to enable drag
function DraggableCard({ request }: { request: Request }) {
    return (
        <div 
            draggable 
            onDragStart={(e) => {
                e.dataTransfer.setData("requestId", request._id)
                e.dataTransfer.effectAllowed = "move"
            }}
        >
            <RequestCard request={request} />
        </div>
    )
}

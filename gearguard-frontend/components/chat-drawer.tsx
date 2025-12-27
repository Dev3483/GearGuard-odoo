"use client"

import { isAxiosError } from "axios"

import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import axios from "@/lib/axios"
import { useSocket } from "@/hooks/use-socket"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name: string
    role: string
  }
  type: string
  createdAt: string
}

interface ChatDrawerProps {
  requestId: string | null
  requestSubject: string
  isOpen: boolean
  onClose: () => void
  currentUserId: string // To distinguish own messages
}

export function ChatDrawer({ requestId, requestSubject, isOpen, onClose, currentUserId }: ChatDrawerProps) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch history when drawer opens
  useEffect(() => {
    if (isOpen && requestId) {
      setLoading(true)
      axios
        .get(`/chat/${requestId}`)
        .then((res) => {
          setMessages(res.data.data)
          scrollToBottom()
        })
        .catch((err) => {
          console.error("Failed to fetch messages:", err)
          if (isAxiosError(err)) {
             console.error("Axios error details:", err.response?.data, err.response?.status)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, requestId])

  // Join room and listen for messages
  useEffect(() => {
    if (!socket || !isConnected || !requestId) return

    console.log("Attempting to join room:", requestId)
    socket.emit("join_room", requestId)

    const handleReceiveMessage = (message: Message) => {
      console.log("Received message:", message)
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    }

    socket.on("receive_message", handleReceiveMessage)

    return () => {
      socket.off("receive_message", handleReceiveMessage)
    }
  }, [socket, isConnected, requestId])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleSend = () => {
    if (!socket || !newMessage.trim() || !requestId) return

    const messageData = {
      requestId,
      content: newMessage,
      type: "text",
    }

    console.log("Sending message:", messageData)
    socket.emit("send_message", messageData)
    setNewMessage("")
    // Optimistic update could happen here, but waiting for server broadcast is safer for consistency
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 glass border-l border-border/50">
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <span className="truncate">{requestSubject || "Request Chat"}</span>
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-normal">Online</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-muted-foreground font-normal">Offline</span>
                </>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        {/* Error Banner */}
        {!isConnected && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 text-center">
                Connection lost. Reconnecting...
            </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender._id === currentUserId
                return (
                  <div
                    key={msg._id || index}
                    className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn(isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        {msg.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[80%] text-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none"
                      )}
                    >
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="font-semibold text-xs opacity-90">{msg.sender?.name || "Unknown"}</span>
                        <span className="text-[10px] opacity-70">
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-background/50"
              disabled={!isConnected}
            />
            <Button onClick={handleSend} disabled={!isConnected || !newMessage.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

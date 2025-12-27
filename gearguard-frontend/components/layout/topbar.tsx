"use client"

import { Bell, Search, User } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/context/sidebar-context"
import { motion } from "framer-motion"

export function Topbar() {
    const { user, logout } = useAuth()
    const { collapsed } = useSidebar()

    return (
        <motion.header
            className="fixed top-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 px-6 flex items-center justify-between"
            initial={false}
            animate={{ left: collapsed ? 80 : 256, width: `calc(100% - ${collapsed ? 80 : 256}px)` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search request, equipment, or team..."
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </Button>

                <ModeToggle />

                <div className="h-8 w-px bg-border mx-2" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 pl-2 pr-4">
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {user?.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    )
}

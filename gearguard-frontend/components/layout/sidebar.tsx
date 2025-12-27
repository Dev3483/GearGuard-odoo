"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    Package,
    LineChart as ChartLine
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/context/sidebar-context"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { collapsed, setCollapsed } = useSidebar()

    const navItems = [
        {
            title: "Dashboard",
            href: user?.role === "manager"
                ? "/dashboard/manager"
                : user?.role === "technician"
                    ? "/dashboard/technician"
                    : "/dashboard/requester",
            icon: LayoutDashboard,
            roles: ["manager", "technician", "requester"],
        },
        {
            title: "Requests",
            href: "/requests",
            icon: ClipboardList,
            roles: ["manager", "technician", "requester"],
        },
        {
            title: "Calendar",
            href: "/calendar",
            icon: Calendar,
            roles: ["manager", "technician"],
        },
        {
            title: "Teams",
            href: "/teams",
            icon: Users,
            roles: ["manager"],
        },
        {
            title: "Equipment",
            href: "/equipment",
            icon: Package,
            roles: ["manager", "technician"],
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
            roles: ["manager", "technician", "requester"],
        },
        {
    title: "Analytics",
    href: "/analytics",
    icon: ChartLine,
    roles: ["admin"],
  },
    ]

    const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

    return (
        <motion.div
            className={cn(
                "fixed left-0 top-0 h-screen bg-card border-r z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
                collapsed ? "w-20" : "w-64"
            )}
            initial={false}
            animate={{ width: collapsed ? 80 : 256 }}
        >
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">GearGuard</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto", collapsed && "mx-auto")}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.title}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isActive && !collapsed && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/10 -z-10 rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t bg-muted/20">
                <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                        {user?.name?.[0] || "U"}
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 overflow-hidden"
                            >
                                <p className="font-medium text-sm truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!collapsed && (
                        <Button variant="ghost" size="icon" onClick={logout} className="hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

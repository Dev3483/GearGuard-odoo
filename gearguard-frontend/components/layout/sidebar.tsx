"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Wrench, Users, Package, Calendar, LogOut, ShieldCheck, ClipboardList } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: any
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "technician", "requester"],
  },
  {
    title: "Requests",
    href: "/requests",
    icon: ClipboardList,
    roles: ["admin", "manager", "technician", "requester"],
  },
  {
    title: "Equipment",
    href: "/equipment",
    icon: Package,
    roles: ["admin", "manager"],
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    roles: ["admin", "manager", "technician"],
  },
  {
    title: "Users",
    href: "/users",
    icon: ShieldCheck,
    roles: ["admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 glass border-r border-border/50 flex flex-col z-40"
    >
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-2">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GearGuard
            </h1>
            <p className="text-xs text-muted-foreground">Maintenance Tracker</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="px-4 py-3 rounded-lg bg-muted/30">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-2">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                user?.role === "admin" && "bg-destructive/20 text-destructive",
                user?.role === "manager" && "bg-warning/20 text-warning-foreground",
                user?.role === "technician" && "bg-primary/20 text-primary",
                user?.role === "requester" && "bg-accent/20 text-accent-foreground",
              )}
            >
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="w-full justify-start bg-transparent" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </motion.aside>
  )
}

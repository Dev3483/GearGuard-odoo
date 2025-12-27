"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        manager: "/dashboard/manager",
        technician: "/dashboard/technician",
        requester: "/dashboard/requester",
      }
      router.push(roleRoutes[user.role] || "/dashboard/requester")
    } else if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

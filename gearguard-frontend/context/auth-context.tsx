"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"

interface User {
  id: string
  _id?: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (token && savedUser && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        
        // Verify token is still valid
        axios
          .get("/auth/me")
          .then((res) => {
             // Backend might return { success: true, data: user } or just user. 
             // Aligning with standard response format if applicable.
             const remoteUser = res.data.data || res.data
             if (remoteUser) {
                 setUser(remoteUser)
                 localStorage.setItem("user", JSON.stringify(remoteUser))
             }
          })
          .catch(() => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch (error) {
         console.error("Failed to parse user from local storage", error)
         localStorage.removeItem("token")
         localStorage.removeItem("user")
         setUser(null)
         setLoading(false)
      }
    } else {
      setLoading(false)
      // Clean up if undefined string exists
      if (savedUser === "undefined") {
          localStorage.removeItem("user")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    console.log("[v0] Attempting login with:", { email })
    try {
      const response = await axios.post("/auth/login", { email, password })
      console.log("[v0] Login response:", response.data)
      const { token, user: userData } = response.data.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        manager: "/dashboard/manager",
        technician: "/dashboard/technician",
        requester: "/dashboard/requester",
      }

      router.push(roleRoutes[userData.role] || "/dashboard/requester")
    } catch (error) {
      console.log("[v0] Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, role = "requester") => {
    console.log("[v0] Attempting registration with:", { name, email, role })
    try {
      const response = await axios.post("/auth/register", { name, email, password, role })
      console.log("[v0] Register response:", response.data)
      const { token, user: userData } = response.data.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        manager: "/dashboard/manager",
        technician: "/dashboard/technician",
        requester: "/dashboard/requester",
      }

      router.push(roleRoutes[userData.role] || "/dashboard/requester")
    } catch (error) {
      console.log("[v0] Register error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

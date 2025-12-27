"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Wrench, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Login form submitted")
      await login(email, password)
      toast.success("Welcome back!")
    } catch (error: any) {
      console.log("[v0] Login error caught:", error)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid credentials. Please check your email and password."
      toast.error(errorMessage)

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        toast.error("Cannot connect to server. Make sure the backend is running on http://localhost:5000")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-primary rounded-2xl p-4"
          >
            <Wrench className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold ml-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            GearGuard
          </motion.h1>
        </div>

        <Card className="glass border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {"Don't have an account? "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 glass rounded-lg"
        >
          <p className="text-xs text-muted-foreground mb-2 font-medium">Test Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-foreground">Admin</p>
              <p className="text-muted-foreground">admin@gearguard.com</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Manager</p>
              <p className="text-muted-foreground">manager@gearguard.com</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Technician</p>
              <p className="text-muted-foreground">tech@gearguard.com</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Requester</p>
              <p className="text-muted-foreground">requester@gearguard.com</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Password: password123</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

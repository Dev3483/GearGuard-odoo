import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/auth-context"
import { SidebarProvider } from "@/context/sidebar-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "GearGuard - Maintenance Tracking System",
    description: "Track and manage equipment maintenance, requests, and teams.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <SidebarProvider>
                            {children}
                            <Toaster />
                        </SidebarProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

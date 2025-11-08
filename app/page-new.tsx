"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/login')
      } else if (user) {
        // Redirect to role-appropriate page if authenticated
        switch (user.role) {
          case 'admin':
            router.push('/admin')
            break
          case 'project_manager':
            router.push('/manager')
            break
          case 'finance':
            router.push('/finance')
            break
          case 'team_member':
            router.push('/employee')
            break
          default:
            router.push('/login')
        }
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  // Show loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading OneFlow...</p>
      </div>
    </div>
  )
}

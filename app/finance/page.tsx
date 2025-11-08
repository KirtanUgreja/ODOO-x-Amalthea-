"use client"

import { useAuth } from "@/lib/auth-context"
import { FinanceDashboard } from "@/components/finance-dashboard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FinancePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && user && !['admin', 'finance'].includes(user.role)) {
      // Redirect users who don't have finance access
      switch (user.role) {
        case 'project_manager':
          router.push('/manager')
          break
        case 'team_member':
          router.push('/employee')
          break
        default:
          router.push('/login')
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  if (!['admin', 'finance'].includes(user.role)) {
    return null // Will redirect to appropriate page
  }

  return <FinanceDashboard />
}

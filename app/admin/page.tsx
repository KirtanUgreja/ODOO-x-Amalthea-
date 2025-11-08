"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/admin-dashboard-new"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && user && user.role !== 'admin') {
      // Redirect non-admin users to their appropriate page
      switch (user.role) {
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

  if (user.role !== 'admin') {
    return null // Will redirect to appropriate page
  }

  return <AdminDashboard />
}

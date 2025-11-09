"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "project_manager":
            router.push("/pm/dashboard")
            break
          case "team_member":
            router.push("/team/dashboard")
            break
          case "sales_finance":
            router.push("/finance/dashboard")
            break
          default:
            router.push("/login")
        }
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-8">Redirecting...</div>
      </div>
    </div>
  )
}

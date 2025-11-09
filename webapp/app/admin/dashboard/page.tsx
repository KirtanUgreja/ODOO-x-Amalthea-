"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { AdminKPICards } from "@/components/admin/admin-kpi-cards"
import { RoleViewSwitcher } from "@/components/admin/role-view-switcher"
import { AdminOverviewSections } from "@/components/admin/admin-overview-sections"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [currentView, setCurrentView] = useState("admin")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--odoo-primary)" }}></div>
          <p style={{ color: "var(--odoo-text)" }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Admin Dashboard
                </h1>
                <p className="text-lg" style={{ color: "var(--odoo-muted)" }}>
                  Complete system control and organization-wide oversight
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Welcome back,</p>
                <p className="text-xl font-semibold" style={{ color: "var(--odoo-text)" }}>{user?.name}</p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <AdminKPICards db={db} />

          {/* Role View Switcher */}
          <RoleViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />

          {/* Dynamic Content Based on View */}
          <AdminOverviewSections db={db} currentView={currentView} />
        </div>
      </div>
    </div>
  )
}

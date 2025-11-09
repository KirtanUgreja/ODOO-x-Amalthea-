"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Activity, Clock, User, Calendar, Filter } from "lucide-react"

export default function UserActivity() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [selectedUser, setSelectedUser] = useState("all")
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const generateActivityData = () => {
    if (!db) return []
    
    return [
      { id: 1, userId: "tm-1", action: "Logged 8 hours", type: "timesheet", timestamp: "2024-01-15T10:30:00Z", details: "Task: Design Homepage" },
      { id: 2, userId: "pm-1", action: "Created new task", type: "task", timestamp: "2024-01-15T09:15:00Z", details: "Build Backend API" },
      { id: 3, userId: "tm-2", action: "Submitted expense", type: "expense", timestamp: "2024-01-14T16:45:00Z", details: "Client travel - ₹1500" },
      { id: 4, userId: "admin-1", action: "Updated user role", type: "user", timestamp: "2024-01-14T14:20:00Z", details: "Changed Bob to Project Manager" },
      { id: 5, userId: "sf-1", action: "Created sales order", type: "sales", timestamp: "2024-01-14T11:30:00Z", details: "Brand Website - ₹100000" }
    ]
  }

  const activities = generateActivityData()
  const filteredActivities = activities.filter(activity => 
    selectedUser === "all" || activity.userId === selectedUser
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "timesheet": return Clock
      case "task": return Activity
      case "expense": return Activity
      case "user": return User
      case "sales": return Activity
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "timesheet": return "#ffc107"
      case "task": return "#00A09D"
      case "expense": return "#dc3545"
      case "user": return "#007bff"
      case "sales": return "#28a745"
      default: return "var(--odoo-muted)"
    }
  }

  if (loading || !db) return <div>Loading...</div>

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>User Activity</h1>
            <p style={{ color: "var(--odoo-muted)" }}>Monitor all user actions and system activity</p>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <User size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Users</option>
                  {db.users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Activities</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{activities.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Active Users</h3>
              <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{new Set(activities.map(a => a.userId)).size}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Time Entries</h3>
              <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{activities.filter(a => a.type === "timesheet").length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>System Changes</h3>
              <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{activities.filter(a => a.type === "user").length}</p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Activity Timeline</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const activityUser = db.users.find((u: any) => u.id === activity.userId)
                  const Icon = getActivityIcon(activity.type)
                  const color = getActivityColor(activity.type)
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: color + "20" }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium" style={{ color: "var(--odoo-text)" }}>
                            {activityUser?.name || "Unknown User"}
                          </h4>
                          <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ color: "var(--odoo-text)" }}>{activity.action}</p>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{activity.details}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
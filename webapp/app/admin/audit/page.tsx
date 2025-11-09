"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Eye, Shield, Activity, Filter, Search, Download, Calendar, User, FileText } from "lucide-react"

export default function AdminAudit() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Generate dynamic audit logs from database activities
  const generateAuditLogs = () => {
    const logs: any[] = []
    
    // User creation logs
    db.users.forEach((user: any) => {
      if (user.createdAt) {
        logs.push({
          id: `audit-user-${user.id}`,
          timestamp: user.createdAt,
          userId: "admin-1",
          action: "CREATE",
          resource: "USER",
          resourceId: user.id,
          details: `Created user: ${user.name} (${user.role})`,
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    // Project creation logs
    db.projects.forEach((project: any) => {
      if (project.createdAt) {
        logs.push({
          id: `audit-project-${project.id}`,
          timestamp: project.createdAt,
          userId: project.managerId || "admin-1",
          action: "CREATE",
          resource: "PROJECT",
          resourceId: project.id,
          details: `Created project: ${project.name} (Budget: ₹${project.budget})`,
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    // Task creation logs
    db.tasks.forEach((task: any) => {
      if (task.createdAt) {
        logs.push({
          id: `audit-task-${task.id}`,
          timestamp: task.createdAt,
          userId: task.assignedTo || "admin-1",
          action: "CREATE",
          resource: "TASK",
          resourceId: task.id,
          details: `Created task: ${task.title} (Priority: ${task.priority})`,
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    // Timesheet logs
    db.timesheets.forEach((timesheet: any) => {
      if (timesheet.createdAt) {
        const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
        logs.push({
          id: `audit-timesheet-${timesheet.id}`,
          timestamp: timesheet.createdAt,
          userId: timesheet.userId,
          action: "CREATE",
          resource: "TIMESHEET",
          resourceId: timesheet.id,
          details: `Logged ${timesheet.hours} hours for task: ${task?.title || 'Unknown task'}`,
          ipAddress: "192.168.1.103",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    // Expense approval logs
    db.expenses.forEach((expense: any) => {
      if (expense.status === 'approved' && expense.approvedBy) {
        logs.push({
          id: `audit-expense-${expense.id}`,
          timestamp: expense.createdAt,
          userId: expense.approvedBy,
          action: "APPROVE",
          resource: "EXPENSE",
          resourceId: expense.id,
          details: `Approved expense: ${expense.description} - ₹${expense.amount}`,
          ipAddress: "192.168.1.104",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    // Sales order logs
    db.salesOrders.forEach((so: any) => {
      if (so.createdAt) {
        logs.push({
          id: `audit-so-${so.id}`,
          timestamp: so.createdAt,
          userId: "sf-1",
          action: "CREATE",
          resource: "SALES_ORDER",
          resourceId: so.id,
          details: `Created sales order: ${so.description} - ₹${so.amount}`,
          ipAddress: "192.168.1.105",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
      }
    })
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  
  const auditLogs = generateAuditLogs()

  const filteredLogs = auditLogs.filter((log) => {
    const user = db.users.find((u: any) => u.id === log.userId)
    const matchesFilter = filter === "all" || log.action.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchTerm === "" || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const logDate = new Date(log.timestamp)
      const now = new Date()
      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= monthAgo
          break
      }
    }
    
    return matchesFilter && matchesSearch && matchesDate
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "#28a745"
      case "UPDATE": return "#ffc107"
      case "DELETE": return "#dc3545"
      case "APPROVE": return "#007bff"
      case "ASSIGN": return "#6f42c1"
      default: return "var(--odoo-muted)"
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "USER": return User
      case "PROJECT": return FileText
      case "TASK": return Activity
      case "EXPENSE": return FileText
      case "SALES_ORDER": return FileText
      case "TIMESHEET": return Activity
      default: return FileText
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Audit Logs & System Monitoring
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Complete audit trail of all system actions and user activities
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export Logs
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                  <Shield size={16} />
                  Security Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Actions</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{auditLogs.length}</p>
                </div>
                <Activity size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Users</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                    {new Set(auditLogs.map(log => log.userId)).size}
                  </p>
                </div>
                <User size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Today's Actions</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                    {auditLogs.filter(log => 
                      new Date(log.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Security Events</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>0</p>
                </div>
                <Shield size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="assign">Assign</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>User</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Action</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Resource</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Details</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>IP Address</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const logUser = db.users.find((u: any) => u.id === log.userId)
                    const ResourceIcon = getResourceIcon(log.resource)
                    
                    return (
                      <tr 
                        key={log.id} 
                        className={index % 2 === 0 ? "" : ""}
                        style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {logUser?.name || "Unknown User"}
                            </p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {logUser?.role.replace("_", " ") || "Unknown Role"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getActionColor(log.action) + "20",
                              color: getActionColor(log.action)
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ResourceIcon size={16} style={{ color: "var(--odoo-muted)" }} />
                            <span style={{ color: "var(--odoo-text)" }}>
                              {log.resource.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm max-w-xs" style={{ color: "var(--odoo-text)" }}>
                            {log.details}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-mono" style={{ color: "var(--odoo-muted)" }}>
                            {log.ipAddress}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            className="p-1 rounded hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No audit logs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
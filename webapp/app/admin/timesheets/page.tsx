"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Clock, Edit, Trash2, Eye, Filter, Search, Download, AlertTriangle, CheckCircle } from "lucide-react"

export default function AdminTimesheets() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [billableFilter, setBillableFilter] = useState("all")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredTimesheets = db.timesheets.filter((timesheet: any) => {
    const employee = db.users.find((u: any) => u.id === timesheet.userId)
    const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
    
    const matchesBillable = billableFilter === "all" || 
      (billableFilter === "billable" && timesheet.billable) ||
      (billableFilter === "non-billable" && !timesheet.billable)
    
    const matchesSearch = searchTerm === "" || 
      employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesBillable && matchesSearch
  })

  const totalHours = db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)
  const billableHours = db.timesheets.filter((t: any) => t.billable).reduce((sum: number, t: any) => sum + t.hours, 0)
  const nonBillableHours = totalHours - billableHours
  const totalEntries = db.timesheets.length

  const totalCosts = db.timesheets.reduce((sum: number, t: any) => {
    const employee = db.users.find((u: any) => u.id === t.userId)
    return sum + (t.hours * (employee?.hourlyRate || 0))
  }, 0)

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
                  All Timesheets Management
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  View, edit, and audit all employee timesheet entries
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                  <Eye size={16} />
                  Audit Trail
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Hours</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{totalHours}</p>
                </div>
                <Clock size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billable Hours</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{billableHours}</p>
                </div>
                <CheckCircle size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Non-Billable</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{nonBillableHours}</p>
                </div>
                <AlertTriangle size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Entries</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{totalEntries}</p>
                </div>
                <Eye size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Cost</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>₹{totalCosts}</p>
                </div>
                <Clock size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Billability Rate */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h3 className="font-semibold mb-3" style={{ color: "var(--odoo-text)" }}>Billability Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "var(--odoo-primary)" }}>
                  {totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billability Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "#28a745" }}>
                  ₹{billableHours * (totalCosts / totalHours || 0)}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billable Revenue Potential</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                  {Math.round(totalHours / (db.users.filter((u: any) => u.role === 'team_member').length || 1))}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Avg Hours per Employee</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={billableFilter} 
                  onChange={(e) => setBillableFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Entries</option>
                  <option value="billable">Billable Only</option>
                  <option value="non-billable">Non-Billable Only</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search timesheets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Timesheets Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Employee</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Task</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Hours</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Cost</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Billable</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Notes</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map((timesheet: any, index: number) => {
                    const employee = db.users.find((u: any) => u.id === timesheet.userId)
                    const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
                    const project = task ? db.projects.find((p: any) => p.id === task.projectId) : null
                    const cost = timesheet.hours * (employee?.hourlyRate || 0)
                    
                    return (
                      <tr 
                        key={timesheet.id} 
                        className={index % 2 === 0 ? "" : ""}
                        style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {employee?.name || "Unknown"}
                            </p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              ₹{employee?.hourlyRate || 0}/hr
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                            {task?.title || "Unknown Task"}
                          </p>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {project?.name || "No Project"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-lg" style={{ color: "var(--odoo-text)" }}>
                            {timesheet.hours}h
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold" style={{ color: "#dc3545" }}>
                            ₹{cost}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: timesheet.billable ? "#28a745" : "#6c757d",
                              color: "white"
                            }}
                          >
                            {timesheet.billable ? "Billable" : "Non-Billable"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                          {new Date(timesheet.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm max-w-xs truncate" style={{ color: "var(--odoo-text)" }}>
                            {timesheet.notes || "No notes"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit Timesheet"
                            >
                              <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-red-100"
                              title="Delete Timesheet"
                            >
                              <Trash2 size={16} style={{ color: "#dc3545" }} />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-blue-100"
                              title="View Details"
                            >
                              <Eye size={16} style={{ color: "var(--odoo-primary)" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTimesheets.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No timesheet entries found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
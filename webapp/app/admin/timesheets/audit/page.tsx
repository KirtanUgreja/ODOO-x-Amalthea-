"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Shield, Clock, AlertTriangle, CheckCircle, Eye, Filter, Calendar } from "lucide-react"

export default function TimesheetAudit() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [auditFilter, setAuditFilter] = useState("all")
  const [dateRange, setDateRange] = useState("week")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const generateAuditData = () => {
    if (!db) return []
    
    return db.timesheets.map((timesheet: any) => {
      const employee = db.users.find((u: any) => u.id === timesheet.userId)
      const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
      const project = db.projects.find((p: any) => p.id === timesheet.projectId)
      
      // Determine audit type and severity based on timesheet data
      let type = "normal_entry"
      let severity = "low"
      let description = "Regular timesheet entry"
      let details = `${timesheet.hours} hours logged for ${task?.title || 'Unknown task'}`
      
      if (timesheet.hours > 12) {
        type = "suspicious_hours"
        severity = "high"
        description = `Employee logged ${timesheet.hours} hours in a single day`
        details = "Exceeded normal working hours threshold"
      } else if (timesheet.hours > 8) {
        type = "overtime_entry"
        severity = "medium"
        description = `Overtime hours logged: ${timesheet.hours} hours`
        details = "Entry exceeds standard 8-hour workday"
      }
      
      const entryDate = new Date(timesheet.date)
      if (entryDate.getDay() === 0 || entryDate.getDay() === 6) {
        type = "weekend_entry"
        severity = "medium"
        description = "Time logged on weekend"
        details = `Entry made on ${entryDate.getDay() === 0 ? 'Sunday' : 'Saturday'}`
      }
      
      return {
        id: `audit-${timesheet.id}`,
        type,
        severity,
        description,
        employeeId: timesheet.userId,
        timesheetId: timesheet.id,
        date: timesheet.date,
        details,
        status: timesheet.approvalStatus || "pending",
        hours: timesheet.hours,
        taskName: task?.title,
        projectName: project?.name,
        billable: timesheet.billable
      }
    })
  }

  const auditData = generateAuditData()
  const filteredAudits = auditData.filter(audit => 
    auditFilter === "all" || audit.type === auditFilter
  )

  const handleApprove = async (timesheetId: string) => {
    if (!db) return
    
    const updatedTimesheets = db.timesheets.map((t: any) =>
      t.id === timesheetId ? { ...t, approvalStatus: 'approved', approvedBy: user?.id, approvedAt: new Date().toISOString() } : t
    )
    await updateDb({ timesheets: updatedTimesheets })
  }

  const handleReject = async (timesheetId: string) => {
    if (!db) return
    
    const updatedTimesheets = db.timesheets.map((t: any) =>
      t.id === timesheetId ? { ...t, approvalStatus: 'rejected', rejectedBy: user?.id, rejectedAt: new Date().toISOString() } : t
    )
    await updateDb({ timesheets: updatedTimesheets })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "#dc3545"
      case "medium": return "#ffc107"
      case "low": return "#28a745"
      default: return "var(--odoo-muted)"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#ffc107"
      case "approved": return "#28a745"
      case "rejected": return "#dc3545"
      case "flagged": return "#dc3545"
      case "reviewed": return "#ffc107"
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: "var(--odoo-text)" }}>
                  <Shield size={32} style={{ color: "var(--odoo-primary)" }} />
                  Timesheet Audit
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>Monitor and audit timesheet entries for compliance and accuracy</p>
              </div>
              <div className="flex gap-3">
                <select 
                  value={auditFilter} 
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Issues</option>
                  <option value="suspicious_hours">Suspicious Hours</option>
                  <option value="duplicate_entry">Duplicate Entries</option>
                  <option value="weekend_entry">Weekend Entries</option>
                  <option value="late_submission">Late Submissions</option>
                </select>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Issues</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{auditData.length}</p>
                </div>
                <Shield size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>High Severity</h3>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>
                    {auditData.filter(a => a.severity === "high").length}
                  </p>
                </div>
                <AlertTriangle size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Pending</h3>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
                    {auditData.filter(a => a.status === "pending").length}
                  </p>
                </div>
                <Clock size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Approved</h3>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                    {auditData.filter(a => a.status === "approved").length}
                  </p>
                </div>
                <CheckCircle size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
          </div>

          {/* Audit Issues List */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Audit Findings</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--odoo-border)" }}>
              {filteredAudits.map((audit) => {
                const employee = db.users.find((u: any) => u.id === audit.employeeId)
                const severityColor = getSeverityColor(audit.severity)
                const statusColor = getStatusColor(audit.status)
                
                return (
                  <div key={audit.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: severityColor }}
                          ></div>
                          <h4 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                            {audit.description}
                          </h4>
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{ backgroundColor: severityColor + "20", color: severityColor }}
                          >
                            {audit.severity}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{ backgroundColor: statusColor + "20", color: statusColor }}
                          >
                            {audit.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <span style={{ color: "var(--odoo-muted)" }}>Employee: </span>
                            <span style={{ color: "var(--odoo-text)" }}>{employee?.name}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--odoo-muted)" }}>Date: </span>
                            <span style={{ color: "var(--odoo-text)" }}>{new Date(audit.date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--odoo-muted)" }}>Hours: </span>
                            <span style={{ color: "var(--odoo-text)" }}>{audit.hours}h</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--odoo-muted)" }}>Project: </span>
                            <span style={{ color: "var(--odoo-text)" }}>{audit.projectName}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{audit.details}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button 
                          className="p-2 rounded hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        {audit.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleApprove(audit.timesheetId)}
                              className="px-3 py-1 rounded text-white text-sm hover:opacity-80"
                              style={{ backgroundColor: "#28a745" }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(audit.timesheetId)}
                              className="px-3 py-1 rounded text-white text-sm hover:opacity-80"
                              style={{ backgroundColor: "#dc3545" }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--odoo-text)" }}>No Audit Issues</h3>
              <p style={{ color: "var(--odoo-muted)" }}>All timesheet entries are compliant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
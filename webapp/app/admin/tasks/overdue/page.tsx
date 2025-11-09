"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { AlertTriangle, Clock, User, Calendar, Edit, MessageSquare } from "lucide-react"

export default function OverdueTasks() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [selectedPriority, setSelectedPriority] = useState("all")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) return <div>Loading...</div>

  const overdueTasks = db.tasks.filter((task: any) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority
    return isOverdue && matchesPriority
  })

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#dc3545"
      case "medium": return "#ffc107"
      case "low": return "#28a745"
      default: return "var(--odoo-muted)"
    }
  }

  const handleSendReminder = (taskId: string) => {
    alert(`Reminder sent for task ${taskId}`)
  }

  const handleExtendDeadline = (taskId: string) => {
    alert(`Deadline extension dialog for task ${taskId}`)
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
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: "var(--odoo-text)" }}>
                  <AlertTriangle size={32} style={{ color: "#dc3545" }} />
                  Overdue Tasks
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>Tasks that have passed their due date and need immediate attention</p>
              </div>
              <select 
                value={selectedPriority} 
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Overdue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Overdue</h3>
              <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{overdueTasks.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>High Priority</h3>
              <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>
                {overdueTasks.filter(t => t.priority === "high").length}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Avg Days Overdue</h3>
              <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
                {overdueTasks.length > 0 ? Math.round(overdueTasks.reduce((sum, t) => sum + getDaysOverdue(t.dueDate), 0) / overdueTasks.length) : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Affected Projects</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>
                {new Set(overdueTasks.map(t => t.projectId)).size}
              </p>
            </div>
          </div>

          {/* Overdue Tasks List */}
          {overdueTasks.length > 0 ? (
            <div className="space-y-4">
              {overdueTasks.map((task) => {
                const project = db.projects.find((p: any) => p.id === task.projectId)
                const assignee = db.users.find((u: any) => u.id === task.assignedTo)
                const daysOverdue = getDaysOverdue(task.dueDate)
                
                return (
                  <div 
                    key={task.id} 
                    className="p-6 rounded-lg border-l-4 hover:shadow-md transition-shadow"
                    style={{ 
                      backgroundColor: "var(--odoo-card)", 
                      borderColor: "var(--odoo-border)",
                      borderLeftColor: "#dc3545"
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>{task.title}</h3>
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: getPriorityColor(task.priority) + "20",
                              color: getPriorityColor(task.priority)
                            }}
                          >
                            {task.priority} Priority
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{ backgroundColor: "#dc3545", color: "white" }}
                          >
                            {daysOverdue} days overdue
                          </span>
                        </div>
                        
                        <p className="mb-3" style={{ color: "var(--odoo-muted)" }}>{task.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={16} style={{ color: "var(--odoo-muted)" }} />
                            <span style={{ color: "var(--odoo-text)" }}>
                              Assigned to: {assignee?.name || "Unassigned"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} style={{ color: "var(--odoo-muted)" }} />
                            <span style={{ color: "var(--odoo-text)" }}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} style={{ color: "var(--odoo-muted)" }} />
                            <span style={{ color: "var(--odoo-text)" }}>
                              Project: {project?.name || "No Project"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button 
                          onClick={() => handleSendReminder(task.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded text-white text-sm"
                          style={{ backgroundColor: "#ffc107" }}
                        >
                          <MessageSquare size={14} />
                          Send Reminder
                        </button>
                        <button 
                          onClick={() => handleExtendDeadline(task.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded text-white text-sm"
                          style={{ backgroundColor: "var(--odoo-primary)" }}
                        >
                          <Calendar size={14} />
                          Extend Deadline
                        </button>
                        <button 
                          className="flex items-center gap-2 px-3 py-2 rounded border text-sm"
                          style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                        >
                          <Edit size={14} />
                          Edit Task
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <Clock size={48} className="mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--odoo-text)" }}>No Overdue Tasks</h3>
              <p style={{ color: "var(--odoo-muted)" }}>Great! All tasks are on track or completed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Clock, User, Calendar, FileText, DollarSign } from "lucide-react"
import { useState } from "react"

export default function TimesheetsPage() {
  const { user } = useAuth()
  const { db, loading, error, getProjectData } = useDb()
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedMember, setSelectedMember] = useState("all")

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const projectData = getProjectData(user.id)
  if (!projectData) return <div className="flex items-center justify-center h-screen">Unable to load timesheets</div>

  const myProjects = projectData.projects
  const myTimesheets = projectData.timesheets

  const filteredTimesheets = myTimesheets.filter((ts: any) => {
    if (selectedProject !== "all" && ts.projectId !== selectedProject) return false
    if (selectedMember !== "all" && ts.userId !== selectedMember) return false
    return true
  })

  const teamMembers = db.users.filter((u: any) => 
    u.role === "team_member" && 
    myTimesheets.some((ts: any) => ts.userId === u.id)
  )

  const totalHours = filteredTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
  const billableHours = filteredTimesheets.filter((ts: any) => ts.billable).reduce((sum, ts: any) => sum + ts.hours, 0)
  const nonBillableHours = totalHours - billableHours

  const totalCost = filteredTimesheets.reduce((sum, ts: any) => {
    const member = db.users.find((u: any) => u.id === ts.userId)
    return sum + (ts.hours * (member?.hourlyRate || 0))
  }, 0)

  const billableCost = filteredTimesheets
    .filter((ts: any) => ts.billable)
    .reduce((sum, ts: any) => {
      const member = db.users.find((u: any) => u.id === ts.userId)
      return sum + (ts.hours * (member?.hourlyRate || 0))
    }, 0)

  const stats = [
    {
      label: "Total Hours",
      value: totalHours,
      icon: Clock,
      color: "#007bff"
    },
    {
      label: "Billable Hours", 
      value: billableHours,
      icon: DollarSign,
      color: "#28a745"
    },
    {
      label: "Non-billable Hours",
      value: nonBillableHours,
      icon: FileText,
      color: "#6c757d"
    },
    {
      label: "Total Cost",
      value: `₹${totalCost.toLocaleString()}`,
      icon: DollarSign,
      color: "#ffc107"
    }
  ]

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              Timesheet Tracking
            </h1>
            <div className="flex gap-4">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Projects</option>
                {myProjects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Members</option>
                {teamMembers.map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-2" style={{ color: "var(--odoo-text)" }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                  Timesheet Entries
                </h2>
                <div className="space-y-3">
                  {filteredTimesheets
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((timesheet: any) => {
                      const project = myProjects.find((p: any) => p.id === timesheet.projectId)
                      const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
                      const member = db.users.find((u: any) => u.id === timesheet.userId)
                      const cost = timesheet.hours * (member?.hourlyRate || 0)
                      
                      return (
                        <div 
                          key={timesheet.id} 
                          className="p-4 rounded border-l-4" 
                          style={{ 
                            backgroundColor: "var(--odoo-light-bg)",
                            borderLeftColor: timesheet.billable ? "#28a745" : "#6c757d"
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-semibold">{task?.title || "General Work"}</h3>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  timesheet.billable 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {timesheet.billable ? "Billable" : "Non-billable"}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <User size={14} />
                                  <span>{member?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText size={14} />
                                  <span>{project?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{new Date(timesheet.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>{timesheet.hours}h</span>
                                </div>
                              </div>
                              
                              {timesheet.notes && (
                                <p className="text-sm mt-2" style={{ color: "var(--odoo-muted)" }}>
                                  {timesheet.notes}
                                </p>
                              )}\n                            </div>
                            
                            <div className="text-right">
                              <p className="font-semibold">₹{cost.toLocaleString()}</p>
                              <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                                @₹{member?.hourlyRate}/hr
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="font-semibold mb-4">Hours by Member</h3>
                <div className="space-y-3">
                  {teamMembers.map((member: any) => {
                    const memberTimesheets = filteredTimesheets.filter((ts: any) => ts.userId === member.id)
                    const memberHours = memberTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
                    const memberBillable = memberTimesheets.filter((ts: any) => ts.billable).reduce((sum, ts: any) => sum + ts.hours, 0)
                    
                    return (
                      <div key={member.id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                            {memberBillable}h billable / {memberHours}h total
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{memberHours}h</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="font-semibold mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <span>Billable Cost</span>
                    <span className="font-semibold text-green-600">₹{billableCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <span>Non-billable Cost</span>
                    <span className="font-semibold text-gray-600">₹{(totalCost - billableCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded font-semibold" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                    <span>Total Cost</span>
                    <span>₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredTimesheets.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: "var(--odoo-muted)" }}>No timesheet entries found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
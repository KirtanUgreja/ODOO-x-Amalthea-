"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Users, Clock, CheckCircle, DollarSign, UserMinus, UserPlus, Plus, Search, Filter } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function TeamPage() {
  const { user } = useAuth()
  const { db, loading, error, updateRecord, getProjectData } = useDb()
  const [selectedProject, setSelectedProject] = useState("all")
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const projectData = getProjectData(user.id)
  if (!projectData) return <div className="flex items-center justify-center h-screen">Unable to load team data</div>

  const myProjects = projectData.projects
  const allEmployees = db.users.filter((u: any) => u.role === "team_member" || u.role === "project_manager")
  const teamMembers = db.users.filter((u: any) => u.role === "team_member")
  
  const filteredEmployees = allEmployees.filter((emp: any) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || emp.role === filterRole
    return matchesSearch && matchesRole
  })

  const assignMemberToProject = async (memberId: string, projectId: string) => {
    try {
      const project = myProjects.find((p: any) => p.id === projectId)
      const teamMembers = project?.teamMembers || []
      if (!teamMembers.includes(memberId)) {
        await updateRecord('projects', projectId, {
          teamMembers: [...teamMembers, memberId]
        })
      }
    } catch (error) {
      console.error('Failed to assign member:', error)
    }
  }

  const removeMemberFromProject = async (memberId: string, projectId: string) => {
    try {
      const project = myProjects.find((p: any) => p.id === projectId)
      const teamMembers = (project?.teamMembers || []).filter((id: string) => id !== memberId)
      await updateRecord('projects', projectId, { teamMembers })
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const bulkAssignToProject = async (memberIds: string[], projectId: string) => {
    try {
      const project = myProjects.find((p: any) => p.id === projectId)
      const existingMembers = project?.teamMembers || []
      const newMembers = memberIds.filter(id => !existingMembers.includes(id))
      await updateRecord('projects', projectId, {
        teamMembers: [...existingMembers, ...newMembers]
      })
      setShowAddMember(false)
    } catch (error) {
      console.error('Failed to assign members:', error)
    }
  }



  const getMemberStats = (memberId: string) => {
    const memberTasks = db.tasks.filter((t: any) => 
      t.assignedTo === memberId && 
      myProjects.some((p: any) => p.id === t.projectId)
    )
    const completedTasks = memberTasks.filter((t: any) => t.status === "done")
    const memberTimesheets = db.timesheets.filter((ts: any) => 
      ts.userId === memberId && 
      myProjects.some((p: any) => p.id === ts.projectId)
    )
    const totalHours = memberTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
    const memberExpenses = db.expenses.filter((e: any) => 
      e.userId === memberId && 
      myProjects.some((p: any) => p.id === e.projectId)
    )
    const totalExpenses = memberExpenses.reduce((sum, e: any) => sum + e.amount, 0)

    return {
      totalTasks: memberTasks.length,
      completedTasks: completedTasks.length,
      totalHours,
      totalExpenses,
      productivity: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0
    }
  }

  const getProjectMembers = (projectId: string) => {
    const project = myProjects.find((p: any) => p.id === projectId)
    return (project?.teamMembers || []).map((memberId: string) => 
      teamMembers.find((tm: any) => tm.id === memberId)
    ).filter(Boolean)
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                Team Management
              </h1>
              <p style={{ color: "var(--odoo-muted)" }}>Manage team members and project assignments</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2"
                disabled={selectedProject === "all"}
                title={selectedProject === "all" ? "Select a project first" : "Add team members to project"}
              >
                <Plus size={16} />
                Add Team Members
              </Button>
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
            </div>
          </div>

          {selectedProject === "all" ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member: any) => {
                  const stats = getMemberStats(member.id)
                  const assignedProjects = myProjects.filter((p: any) => 
                    (p.teamMembers || []).includes(member.id)
                  )
                  
                  return (
                    <div key={member.id} className="p-6 rounded-lg shadow" style={{ backgroundColor: "var(--odoo-card)" }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold" style={{ color: "var(--odoo-text)" }}>
                            {member.name}
                          </h3>
                          <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm">Tasks</span>
                          </div>
                          <p className="font-semibold">{stats.completedTasks}/{stats.totalTasks}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-sm">Hours</span>
                          </div>
                          <p className="font-semibold">{stats.totalHours}h</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Productivity</span>
                          <span>{stats.productivity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${stats.productivity}%`, 
                              backgroundColor: stats.productivity >= 70 ? "#28a745" : stats.productivity >= 40 ? "#ffc107" : "#dc3545"
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-sm mb-4">
                        <p style={{ color: "var(--odoo-muted)" }}>
                          Assigned to {assignedProjects.length} project(s)
                        </p>
                        <p style={{ color: "var(--odoo-muted)" }}>
                          Expenses: ₹{stats.totalExpenses.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {assignedProjects.map((project: any) => (
                          <div key={project.id} className="flex justify-between items-center p-2 rounded text-sm" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                            <span>{project.name}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeMemberFromProject(member.id, project.id)}
                            >
                              <UserMinus size={12} />
                            </Button>
                          </div>
                        ))}

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                  {myProjects.find((p: any) => p.id === selectedProject)?.name} - Team Members
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Assigned Members</h3>
                    <div className="space-y-2">
                      {getProjectMembers(selectedProject).map((member: any) => {
                        const stats = getMemberStats(member.id)
                        return (
                          <div key={member.id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                                {stats.completedTasks}/{stats.totalTasks} tasks • {stats.totalHours}h logged
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeMemberFromProject(member.id, selectedProject)}
                            >
                              <UserMinus size={12} />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Available Members</h3>
                      <Button 
                        size="sm"
                        onClick={() => setShowAddMember(true)}
                        className="flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Add Multiple
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {teamMembers
                        .filter((member: any) => !getProjectMembers(selectedProject).some((pm: any) => pm.id === member.id))
                        .map((member: any) => {
                          const stats = getMemberStats(member.id)
                          return (
                            <div key={member.id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                                  Productivity: {stats.productivity}% • Rate: ₹{member.hourlyRate}/hr
                                </p>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => assignMemberToProject(member.id, selectedProject)}
                              >
                                <UserPlus size={12} />
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Team Members Dialog */}
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Team Members to Project</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Roles</option>
                    <option value="team_member">Team Members</option>
                    <option value="project_manager">Project Managers</option>
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredEmployees
                      .filter((emp: any) => {
                        const projectMembers = getProjectMembers(selectedProject)
                        return !projectMembers.some((pm: any) => pm.id === emp.id)
                      })
                      .map((employee: any) => {
                        const stats = getMemberStats(employee.id)
                        const assignedProjectsCount = myProjects.filter((p: any) => 
                          (p.teamMembers || []).includes(employee.id)
                        ).length
                        
                        return (
                          <div key={employee.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium">{employee.name}</h4>
                                <p className="text-sm text-gray-600">{employee.email}</p>
                                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                  <span>Role: {employee.role.replace('_', ' ')}</span>
                                  <span>Rate: ₹{employee.hourlyRate}/hr</span>
                                  <span>Projects: {assignedProjectsCount}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle size={12} className="text-green-500" />
                                  <span>{stats.completedTasks}/{stats.totalTasks} tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-blue-500" />
                                  <span>{stats.totalHours}h logged</span>
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-sm font-medium mb-1">{stats.productivity}%</div>
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: `${stats.productivity}%`, 
                                      backgroundColor: stats.productivity >= 70 ? "#28a745" : stats.productivity >= 40 ? "#ffc107" : "#dc3545"
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <Button 
                                size="sm"
                                onClick={() => assignMemberToProject(employee.id, selectedProject)}
                              >
                                <UserPlus size={12} className="mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                  
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No employees found matching your criteria
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {filteredEmployees.filter((emp: any) => {
                      const projectMembers = getProjectMembers(selectedProject)
                      return !projectMembers.some((pm: any) => pm.id === emp.id)
                    }).length} available employees
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddMember(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>


        </div>
      </div>
    </div>
  )
}
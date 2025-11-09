"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Users, Calendar, DollarSign, Archive } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ProjectsPage() {
  const { user } = useAuth()
  const { db, loading, error, updateRecord, deleteRecord, getProjectData } = useDb()
  const [filter, setFilter] = useState("all")

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const projectData = getProjectData(user.id)
  if (!projectData) return <div className="flex items-center justify-center h-screen">Unable to load projects</div>

  const myProjects = projectData.projects
  const filteredProjects = myProjects.filter((p: any) => 
    filter === "all" || p.status === filter
  )

  const archiveProject = async (projectId: string) => {
    try {
      await updateRecord('projects', projectId, { archived: true })
    } catch (error) {
      console.error('Failed to archive project:', error)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await deleteRecord('projects', projectId)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const getProjectProgress = (projectId: string) => {
    const tasks = projectData.tasks.filter((t: any) => t.projectId === projectId)
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter((t: any) => t.status === "done")
    return Math.round((completedTasks.length / tasks.length) * 100)
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              My Projects
            </h1>
            <Link href="/pm/projects/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </Link>
          </div>

          <div className="flex gap-2 mb-6">
            {["all", "planned", "in_progress", "completed", "on_hold"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => {
              const progress = getProjectProgress(project.id)
              const teamCount = project.teamMembers?.length || 0
              
              return (
                <div key={project.id} className="p-6 rounded-lg shadow" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold" style={{ color: "var(--odoo-text)" }}>
                      {project.name}
                    </h3>
                    <div className="flex gap-2">
                      <Link href={`/pm/projects/${project.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => archiveProject(project.id)}>
                        <Archive size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm mb-4" style={{ color: "var(--odoo-muted)" }}>
                    {project.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} style={{ color: "var(--odoo-primary)" }} />
                      <span className="text-sm">Budget: ₹{project.budget?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: "var(--odoo-primary)" }} />
                      <span className="text-sm">{teamCount} Team Members</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: "var(--odoo-primary)" }} />
                      <span className="text-sm">Due: {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${progress}%`, 
                            backgroundColor: "var(--odoo-primary)" 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/pm/projects/${project.id}`}>
                      <Button className="w-full">View Project</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
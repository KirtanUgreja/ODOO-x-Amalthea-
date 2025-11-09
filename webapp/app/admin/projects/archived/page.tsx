"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Archive, RotateCcw, Trash2, Eye, Search, Filter } from "lucide-react"

export default function ArchivedProjects() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [searchTerm, setSearchTerm] = useState("")
  
  const archivedProjects = db?.projects.filter((p: any) => p.status === 'archived') || []

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const filteredProjects = archivedProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestore = async (projectId: string) => {
    if (!db || !confirm("Restore this project from archive?")) return
    
    const updatedProjects = db.projects.map((p: any) =>
      p.id === projectId ? { ...p, status: 'in_progress' } : p
    )
    await updateDb({ projects: updatedProjects })
  }

  const handlePermanentDelete = async (projectId: string) => {
    if (!db || !confirm("Permanently delete this project? This action cannot be undone.")) return
    
    const updatedProjects = db.projects.filter((p: any) => p.id !== projectId)
    await updateDb({ projects: updatedProjects })
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
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Archived Projects</h1>
                <p style={{ color: "var(--odoo-muted)" }}>Manage completed, cancelled, and archived projects</p>
              </div>
              <div className="flex items-center gap-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search archived projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Archive Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Archived</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{archivedProjects.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Active Projects</h3>
              <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                {db?.projects.filter((p: any) => p.status !== 'archived').length || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Projects</h3>
              <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>
                {db?.projects.length || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Value</h3>
              <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
                ₹{archivedProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Archived Projects Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project Name</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Budget vs Final</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Archived Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Reason</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => {
                    const manager = db?.users.find((u: any) => u.id === project.managerId)
                    
                    return (
                      <tr key={project.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{project.name}</p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{project.description}</p>
                            <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>Manager: {manager?.name || 'Unassigned'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: "#6c757d",
                              color: "white"
                            }}
                          >
                            Archived
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              ₹{project.budget.toLocaleString()}
                            </p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Budget</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "var(--odoo-text)" }}>
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm max-w-xs" style={{ color: "var(--odoo-text)" }}>
                            Archived project
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-1 rounded hover:bg-gray-100"
                              title="View Details"
                            >
                              <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleRestore(project.id)}
                              className="p-1 rounded hover:bg-green-100"
                              title="Restore Project"
                            >
                              <RotateCcw size={16} style={{ color: "#28a745" }} />
                            </button>
                            <button 
                              onClick={() => handlePermanentDelete(project.id)}
                              className="p-1 rounded hover:bg-red-100"
                              title="Permanent Delete"
                            >
                              <Trash2 size={16} style={{ color: "#dc3545" }} />
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <Archive size={48} className="mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--odoo-text)" }}>No Archived Projects</h3>
              <p style={{ color: "var(--odoo-muted)" }}>No projects have been archived yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
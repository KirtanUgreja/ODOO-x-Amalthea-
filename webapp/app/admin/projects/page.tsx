"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Edit2, Plus, Trash2 } from "lucide-react"

export default function AdminProjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "new"
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSave = async (projectId?: string) => {
    if (!db) return
    
    const projectData = {
      ...formData,
      budget: Number.parseFloat(formData.budget),
      id: projectId || `proj-${Date.now()}`,
      createdAt: projectId ? undefined : new Date().toISOString()
    }

    let updatedProjects
    if (projectId) {
      updatedProjects = db.projects.map((p: any) =>
        p.id === projectId ? { ...p, ...projectData } : p
      )
    } else {
      updatedProjects = [projectData, ...db.projects]
    }

    await updateDb({ projects: updatedProjects })
    setEditingProject(null)
    setShowAddForm(false)
    setFormData({ name: "", description: "", managerId: "", budget: "", startDate: "", endDate: "", status: "new" })
  }

  const handleDelete = async (projectId: string) => {
    if (!db || !confirm("Are you sure you want to delete this project?")) return
    
    const updatedProjects = db.projects.filter((p: any) => p.id !== projectId)
    await updateDb({ projects: updatedProjects })
  }

  const startEdit = (project: any) => {
    setEditingProject(project.id)
    setFormData({
      name: project.name,
      description: project.description,
      managerId: project.managerId,
      budget: project.budget.toString(),
      startDate: project.startDate?.split('T')[0] || "",
      endDate: project.endDate?.split('T')[0] || "",
      status: project.status
    })
  }

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const projectManagers = db.users.filter((u: any) => u.role === "project_manager")

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                All Projects
              </h1>
              <p style={{ color: "var(--odoo-muted)" }}>Manage all projects in the system</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded text-white"
              style={{ backgroundColor: "var(--odoo-primary)" }}
            >
              <Plus size={20} />
              Add Project
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                Add New Project
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Manager</option>
                  {projectManagers.map((pm: any) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="archived">Archive</option>
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleSave()}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: "var(--odoo-muted)", color: "white" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "var(--odoo-card)" }}>
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>
                    Manager
                  </th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {db.projects.filter((p: any) => p.status !== 'archived').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((project: any) => {
                  const manager = db.users.find((u: any) => u.id === project.managerId)
                  const isEditing = editingProject === project.id

                  return (
                    <tr key={project.id} className="border-t" style={{ borderTopColor: "var(--odoo-border)" }}>
                      <td className="px-6 py-4" style={{ color: "var(--odoo-text)" }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-2 py-1 rounded border w-full"
                            style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                          />
                        ) : (
                          project.name
                        )}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--odoo-muted)" }}>
                        {isEditing ? (
                          <select
                            value={formData.managerId}
                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                            className="px-2 py-1 rounded border w-full"
                            style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                          >
                            {projectManagers.map((pm: any) => (
                              <option key={pm.id} value={pm.id}>{pm.name}</option>
                            ))}
                          </select>
                        ) : (
                          manager?.name || "Unassigned"
                        )}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--odoo-text)" }}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className="px-2 py-1 rounded border w-full"
                            style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                          />
                        ) : (
                          `₹${project.budget}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="px-2 py-1 rounded border"
                            style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="archived">Archive</option>
                          </select>
                        ) : (
                          <span
                            className="px-3 py-1 rounded text-sm font-semibold"
                            style={{
                              backgroundColor: project.status === "in_progress" ? "var(--odoo-accent)" : "var(--odoo-muted)",
                              color: "white",
                            }}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(project.id)}
                              className="px-3 py-1 rounded text-white text-sm"
                              style={{ backgroundColor: "var(--odoo-primary)" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProject(null)}
                              className="px-3 py-1 rounded text-white text-sm"
                              style={{ backgroundColor: "var(--odoo-muted)" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(project)}
                              className="p-2 hover:opacity-70"
                              style={{ color: "var(--odoo-primary)" }}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="p-2 hover:opacity-70"
                              style={{ color: "var(--odoo-danger)" }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
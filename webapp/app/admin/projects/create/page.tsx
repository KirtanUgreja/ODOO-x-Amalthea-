"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Briefcase, Save, ArrowLeft } from "lucide-react"

export default function CreateProject() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "new",
    priority: "medium",
    clientName: "",
    projectType: "fixed_price"
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const newProject = {
      ...formData,
      id: `proj-${Date.now()}`,
      budget: Number.parseFloat(formData.budget),
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    }

    await updateDb({ projects: [newProject, ...db.projects] })
    router.push("/admin/projects")
  }

  if (loading || !db) return <div>Loading...</div>

  const projectManagers = db.users.filter((u: any) => u.role === "project_manager")

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-blue-600 hover:underline">
              <ArrowLeft size={16} /> Back to Projects
            </button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Create New Project</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Project Details</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                    required
                  />
                  <textarea
                    placeholder="Project Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                    rows={4}
                  />
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  />
                </div>
              </div>

              {/* Project Settings */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Configuration</h3>
                <div className="space-y-4">
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  >
                    <option value="">Select Project Manager</option>
                    {projectManagers.map((pm: any) => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                      className="px-3 py-2 rounded border"
                      style={{ borderColor: "var(--odoo-border)" }}
                    >
                      <option value="fixed_price">Fixed Price</option>
                      <option value="time_material">Time & Material</option>
                      <option value="milestone">Milestone Based</option>
                    </select>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="px-3 py-2 rounded border"
                      style={{ borderColor: "var(--odoo-border)" }}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="Budget Amount (₹)"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 rounded-lg border lg:col-span-2" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Timeline & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)" }}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded text-white font-medium"
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Briefcase size={20} />
                Create Project
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded border"
                style={{ borderColor: "var(--odoo-border)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
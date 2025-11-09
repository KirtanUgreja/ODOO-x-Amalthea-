"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EditProjectPage() {
  const { user } = useAuth()
  const { db, updateRecord } = useDb()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "planned"
  })

  useEffect(() => {
    if (db) {
      const project = db.projects.find((p: any) => p.id === projectId)
      if (project) {
        setFormData({
          name: project.name || "",
          description: project.description || "",
          budget: project.budget?.toString() || "",
          startDate: project.startDate?.split('T')[0] || "",
          endDate: project.endDate?.split('T')[0] || "",
          status: project.status || "planned"
        })
      }
    }
  }, [db, projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await updateRecord('projects', projectId, {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      })
      router.push(`/pm/projects/${projectId}`)
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!db) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-6">
            <Link href={`/pm/projects/${projectId}`}>
              <Button variant="outline" className="mb-4">
                <ArrowLeft size={16} className="mr-2" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              Edit Project
            </h1>
          </div>

          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md h-24"
                  placeholder="Project description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Project"}
                </Button>
                <Link href={`/pm/projects/${projectId}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
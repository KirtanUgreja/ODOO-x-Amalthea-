"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { FileText, Plus, Copy, Edit, Trash2, Eye } from "lucide-react"

export default function ProjectTemplates() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [templates] = useState([
    {
      id: "template-1",
      name: "Website Development",
      description: "Standard website development project template",
      tasks: ["Requirements Analysis", "UI/UX Design", "Frontend Development", "Backend Development", "Testing", "Deployment"],
      estimatedDuration: "3 months",
      estimatedBudget: 150000,
      category: "Development",
      usageCount: 12
    },
    {
      id: "template-2", 
      name: "Mobile App Development",
      description: "Complete mobile application development workflow",
      tasks: ["Market Research", "Wireframing", "App Design", "Development", "Testing", "App Store Submission"],
      estimatedDuration: "4 months",
      estimatedBudget: 200000,
      category: "Development",
      usageCount: 8
    },
    {
      id: "template-3",
      name: "Digital Marketing Campaign",
      description: "Comprehensive digital marketing project template",
      tasks: ["Strategy Planning", "Content Creation", "Campaign Setup", "Execution", "Monitoring", "Reporting"],
      estimatedDuration: "2 months", 
      estimatedBudget: 75000,
      category: "Marketing",
      usageCount: 15
    },
    {
      id: "template-4",
      name: "ERP Implementation",
      description: "Enterprise resource planning system implementation",
      tasks: ["Requirements Gathering", "System Analysis", "Configuration", "Data Migration", "Training", "Go-Live"],
      estimatedDuration: "6 months",
      estimatedBudget: 500000,
      category: "Enterprise",
      usageCount: 3
    }
  ])

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleUseTemplate = (templateId: string) => {
    router.push(`/admin/projects/create?template=${templateId}`)
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
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Project Templates</h1>
                <p style={{ color: "var(--odoo-muted)" }}>Pre-configured project templates for faster project creation</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                <Plus size={16} />
                Create Template
              </button>
            </div>
          </div>

          {/* Template Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Templates</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{templates.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Most Used</h3>
              <p className="text-lg font-bold" style={{ color: "#28a745" }}>Digital Marketing</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Categories</h3>
              <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>3</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Usage</h3>
              <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{templates.reduce((sum, t) => sum + t.usageCount, 0)}</p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="p-6 rounded-lg border hover:shadow-md transition-shadow" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--odoo-primary)" + "20" }}>
                      <FileText size={20} style={{ color: "var(--odoo-primary)" }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>{template.name}</h3>
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: "var(--odoo-accent)" + "20", color: "var(--odoo-accent)" }}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-gray-100" title="View Details">
                      <Eye size={14} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100" title="Edit Template">
                      <Edit size={14} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button className="p-1 rounded hover:bg-red-100" title="Delete Template">
                      <Trash2 size={14} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>

                <p className="text-sm mb-4" style={{ color: "var(--odoo-muted)" }}>{template.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--odoo-muted)" }}>Duration</p>
                    <p className="font-semibold" style={{ color: "var(--odoo-text)" }}>{template.estimatedDuration}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--odoo-muted)" }}>Budget</p>
                    <p className="font-semibold" style={{ color: "var(--odoo-text)" }}>₹{template.estimatedBudget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--odoo-muted)" }}>Included Tasks ({template.tasks.length})</p>
                  <div className="space-y-1">
                    {template.tasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--odoo-primary)" }}></div>
                        <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{task}</span>
                      </div>
                    ))}
                    {template.tasks.length > 3 && (
                      <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>+{template.tasks.length - 3} more tasks</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                  <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Used {template.usageCount} times</span>
                  <button 
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded text-white"
                    style={{ backgroundColor: "var(--odoo-primary)" }}
                  >
                    <Copy size={14} />
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
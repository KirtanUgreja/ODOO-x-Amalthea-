"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Shield, Users, Edit, Plus, Save } from "lucide-react"

export default function RoleManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [editingRole, setEditingRole] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const roles = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access and control",
      permissions: ["All Permissions", "User Management", "System Settings", "Financial Override"],
      userCount: db?.users.filter((u: any) => u.role === "admin").length || 0,
      color: "#dc3545"
    },
    {
      id: "project_manager", 
      name: "Project Manager",
      description: "Manage projects, tasks, and team assignments",
      permissions: ["Project Management", "Task Assignment", "Team Oversight", "Budget Tracking"],
      userCount: db?.users.filter((u: any) => u.role === "project_manager").length || 0,
      color: "#714B67"
    },
    {
      id: "team_member",
      name: "Team Member", 
      description: "Execute tasks and log time",
      permissions: ["Task Execution", "Time Logging", "Expense Submission", "Profile Management"],
      userCount: db?.users.filter((u: any) => u.role === "team_member").length || 0,
      color: "#00A09D"
    },
    {
      id: "sales_finance",
      name: "Sales & Finance",
      description: "Handle sales orders and financial operations",
      permissions: ["Sales Management", "Invoice Creation", "Financial Reports", "Customer Relations"],
      userCount: db?.users.filter((u: any) => u.role === "sales_finance").length || 0,
      color: "#F0AD4E"
    }
  ]

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
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Role Management</h1>
                <p style={{ color: "var(--odoo-muted)" }}>Configure user roles and permissions</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                <Plus size={16} />
                Create Role
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: role.color + "20" }}>
                      <Shield size={20} style={{ color: role.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>{role.name}</h3>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{role.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingRole(role.id)}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} style={{ color: "var(--odoo-muted)" }} />
                    <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                      {role.userCount} users assigned
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2" style={{ color: "var(--odoo-text)" }}>Permissions:</h4>
                  <div className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }}></div>
                        <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {editingRole === role.id && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                    <div className="space-y-2">
                      {["Create", "Read", "Update", "Delete", "Export", "Import"].map((perm) => (
                        <label key={perm} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{perm}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setEditingRole(null)}
                        className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm"
                        style={{ backgroundColor: "var(--odoo-primary)" }}
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingRole(null)}
                        className="px-3 py-1 rounded border text-sm"
                        style={{ borderColor: "var(--odoo-border)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
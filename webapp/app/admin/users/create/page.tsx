"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { UserPlus, Save, ArrowLeft } from "lucide-react"

export default function CreateUser() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "team_member",
    hourlyRate: "500",
    department: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const newUser = {
      ...formData,
      id: `user-${Date.now()}`,
      hourlyRate: Number.parseFloat(formData.hourlyRate),
      createdAt: new Date().toISOString(),
      status: "active"
    }

    await updateDb({ users: [newUser, ...db.users] })
    router.push("/admin/users")
  }

  if (loading || !db) return <div>Loading...</div>

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-blue-600 hover:underline">
              <ArrowLeft size={16} /> Back to Users
            </button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Create New User</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="p-6 rounded-lg border mb-6" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                  required
                />
                <input
                  type="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                />
              </div>
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)" }}
                rows={3}
              />
            </div>

            <div className="p-6 rounded-lg border mb-6" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Role & Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                >
                  <option value="admin">Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="team_member">Team Member</option>
                  <option value="sales_finance">Sales/Finance</option>
                </select>
                <input
                  type="number"
                  placeholder="Hourly Rate (₹)"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)" }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded text-white font-medium"
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <UserPlus size={20} />
                Create User
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
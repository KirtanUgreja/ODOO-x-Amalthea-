"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Edit2, Plus, Trash2, Key, Activity } from "lucide-react"

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [newRate, setNewRate] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "team_member", hourlyRate: "500" })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleUpdateRate = async (userId: string) => {
    if (!db) return
    const updatedUsers = db.users.map((u: any) =>
      u.id === userId ? { ...u, hourlyRate: Number.parseFloat(newRate) } : u,
    )
    await updateDb({ users: updatedUsers })
    setEditingRate(null)
    setNewRate("")
  }

  const handleAddUser = async () => {
    if (!db || !newUser.name || !newUser.email || !newUser.password) return
    const userData = {
      ...newUser,
      id: `user-${Date.now()}`,
      hourlyRate: Number.parseFloat(newUser.hourlyRate),
      createdAt: new Date().toISOString()
    }
    await updateDb({ users: [userData, ...db.users] })
    setShowAddForm(false)
    setNewUser({ name: "", email: "", password: "", role: "team_member", hourlyRate: "500" })
  }

  const handleDeleteUser = async (userId: string) => {
    if (!db || !confirm("Delete this user?")) return
    const updatedUsers = db.users.filter((u: any) => u.id !== userId)
    await updateDb({ users: updatedUsers })
  }

  if (loading || !db) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>User Management</h1>
              <p style={{ color: "var(--odoo-muted)" }}>Complete user control - create, edit, delete, set rates</p>
            </div>
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
              <Plus size={20} /> Add User
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Add New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} required />
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} required />
                <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} required />
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                  <option value="admin">Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="team_member">Team Member</option>
                  <option value="sales_finance">Sales/Finance</option>
                </select>
                <input type="number" placeholder="Hourly Rate" value={newUser.hourlyRate} onChange={(e) => setNewUser({...newUser, hourlyRate: e.target.value})} className="px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddUser} className="px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>Create User</button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded" style={{ backgroundColor: "var(--odoo-muted)", color: "white" }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "var(--odoo-card)" }}>
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Name</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Email</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Role</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Hourly Rate</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Activity</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((u: any) => (
                  <tr key={u.id} className="border-t" style={{ borderTopColor: "var(--odoo-border)" }}>
                    <td className="px-6 py-4" style={{ color: "var(--odoo-text)" }}>{u.name}</td>
                    <td className="px-6 py-4" style={{ color: "var(--odoo-muted)" }}>{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded text-sm font-semibold" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--odoo-text)" }}>
                      {editingRate === u.id ? (
                        <div className="flex gap-2">
                          <input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="px-2 py-1 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} />
                          <button onClick={() => handleUpdateRate(u.id)} className="px-3 py-1 rounded text-white text-sm" style={{ backgroundColor: "var(--odoo-primary)" }}>Save</button>
                        </div>
                      ) : (
                        <span>₹{u.hourlyRate}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--odoo-accent)" }}></span>
                        <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingRate(u.id); setNewRate(u.hourlyRate.toString()) }} className="p-2 hover:opacity-70" style={{ color: "var(--odoo-primary)" }}><Edit2 size={18} /></button>
                        <button className="p-2 hover:opacity-70" style={{ color: "var(--odoo-accent)" }}><Key size={18} /></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:opacity-70" style={{ color: "var(--odoo-danger)" }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Analytics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Cost Analysis</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>₹{db.users.reduce((sum: number, u: any) => sum + u.hourlyRate, 0)}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Hourly Rates</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Role Distribution</h3>
              <div className="space-y-1">
                {["admin", "project_manager", "team_member", "sales_finance"].map(role => (
                  <div key={role} className="flex justify-between text-sm">
                    <span style={{ color: "var(--odoo-muted)" }}>{role.replace("_", " ")}</span>
                    <span style={{ color: "var(--odoo-text)" }}>{db.users.filter((u: any) => u.role === role).length}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Activity Overview</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.timesheets.length}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Timesheets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
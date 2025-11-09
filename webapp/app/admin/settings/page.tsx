"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Save, FileText, DollarSign, Users, Shield, BarChart3, Settings as SettingsIcon } from "lucide-react"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [activeTab, setActiveTab] = useState("system")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: "system", label: "System Settings", icon: SettingsIcon },
    { id: "documents", label: "All Documents", icon: FileText },
    { id: "analytics", label: "Global Analytics", icon: BarChart3 },
    { id: "audit", label: "Audit & Override", icon: Shield }
  ]

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Admin Control Center
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Complete system control with no restrictions</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b" style={{ borderColor: "var(--odoo-border)" }}>
            <div className="flex gap-4">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id ? "border-current" : "border-transparent"
                    }`}
                    style={{
                      color: activeTab === tab.id ? "var(--odoo-primary)" : "var(--odoo-muted)"
                    }}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* System Settings Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Company Configuration</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Company Name" defaultValue="OneFlow Solutions" className="w-full px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} />
                    <select className="w-full px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                      <option>Indian Rupee (₹)</option>
                      <option>US Dollar ($)</option>
                    </select>
                    <input type="number" placeholder="Default Hourly Rate" defaultValue="500" className="w-full px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }} />
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Override Powers</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span style={{ color: "var(--odoo-text)" }}>Override any Project Manager action</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span style={{ color: "var(--odoo-text)" }}>Approve any expense without restrictions</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span style={{ color: "var(--odoo-text)" }}>Edit locked financial documents</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span style={{ color: "var(--odoo-text)" }}>Access all user timesheets</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Sales Orders", count: db.salesOrders.length, color: "#714B67" },
                  { label: "Purchase Orders", count: db.purchaseOrders.length, color: "#00A09D" },
                  { label: "Customer Invoices", count: db.invoices.length, color: "#F0AD4E" },
                  { label: "Vendor Bills", count: db.vendorBills.length, color: "#F06050" }
                ].map(doc => (
                  <div key={doc.label} className="p-4 rounded-lg cursor-pointer hover:opacity-80" style={{ backgroundColor: "var(--odoo-card)" }}>
                    <p className="text-2xl font-bold" style={{ color: doc.color }}>{doc.count}</p>
                    <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{doc.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>All Expenses (Admin View)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--odoo-border)" }}>
                        <th className="text-left py-2" style={{ color: "var(--odoo-text)" }}>Employee</th>
                        <th className="text-left py-2" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="text-left py-2" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="text-left py-2" style={{ color: "var(--odoo-text)" }}>Admin Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.expenses.map((expense: any) => {
                        const employee = db.users.find((u: any) => u.id === expense.userId)
                        return (
                          <tr key={expense.id} className="border-b" style={{ borderColor: "var(--odoo-border)" }}>
                            <td className="py-2" style={{ color: "var(--odoo-text)" }}>{employee?.name}</td>
                            <td className="py-2" style={{ color: "var(--odoo-text)" }}>₹{expense.amount}</td>
                            <td className="py-2">
                              <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: expense.status === "pending" ? "var(--odoo-accent)" : "var(--odoo-primary)", color: "white" }}>
                                {expense.status}
                              </span>
                            </td>
                            <td className="py-2">
                              <button className="px-3 py-1 rounded text-white text-sm mr-2" style={{ backgroundColor: "var(--odoo-primary)" }}>Override Approve</button>
                              <button className="px-3 py-1 rounded text-white text-sm" style={{ backgroundColor: "var(--odoo-danger)" }}>Delete</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Global Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Organization Financials</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Total Revenue</span>
                      <span className="font-bold" style={{ color: "var(--odoo-primary)" }}>₹{db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Total Costs</span>
                      <span className="font-bold" style={{ color: "var(--odoo-danger)" }}>₹{db.timesheets.reduce((sum: number, t: any) => {
                        const user = db.users.find((u: any) => u.id === t.userId)
                        return sum + (t.hours * (user?.hourlyRate || 0))
                      }, 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2" style={{ borderColor: "var(--odoo-border)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>Net Profit</span>
                      <span className="font-bold text-lg" style={{ color: "var(--odoo-accent)" }}>₹{db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0) - db.timesheets.reduce((sum: number, t: any) => {
                        const user = db.users.find((u: any) => u.id === t.userId)
                        return sum + (t.hours * (user?.hourlyRate || 0))
                      }, 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Resource Utilization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Total Hours Logged</span>
                      <span className="font-bold" style={{ color: "var(--odoo-text)" }}>{db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Billable Hours</span>
                      <span className="font-bold" style={{ color: "var(--odoo-primary)" }}>{db.timesheets.filter((t: any) => t.billable).reduce((sum: number, t: any) => sum + t.hours, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Active Employees</span>
                      <span className="font-bold" style={{ color: "var(--odoo-text)" }}>{db.users.filter((u: any) => u.role !== "admin").length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Project Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Total Projects</span>
                      <span className="font-bold" style={{ color: "var(--odoo-text)" }}>{db.projects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Active Projects</span>
                      <span className="font-bold" style={{ color: "var(--odoo-primary)" }}>{db.projects.filter((p: any) => p.status === "in_progress").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--odoo-muted)" }}>Total Tasks</span>
                      <span className="font-bold" style={{ color: "var(--odoo-text)" }}>{db.tasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit & Override Tab */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Admin Override Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 rounded border text-left hover:opacity-80" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                    <h4 className="font-bold">Override Task Assignments</h4>
                    <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Reassign any task to any team member</p>
                  </button>
                  <button className="p-4 rounded border text-left hover:opacity-80" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                    <h4 className="font-bold">Approve All Expenses</h4>
                    <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Bulk approve pending expenses</p>
                  </button>
                  <button className="p-4 rounded border text-left hover:opacity-80" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                    <h4 className="font-bold">Edit Locked Documents</h4>
                    <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Modify completed projects and invoices</p>
                  </button>
                  <button className="p-4 rounded border text-left hover:opacity-80" style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}>
                    <h4 className="font-bold">Reset User Passwords</h4>
                    <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Reset passwords for any user</p>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>System Audit Trail</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div>
                      <p style={{ color: "var(--odoo-text)" }}>User "Alice Team Member" logged 8 hours on task "Design Homepage"</p>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Cost calculated: 8 × ₹500 = ₹4,000</p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div>
                      <p style={{ color: "var(--odoo-text)" }}>Admin updated hourly rate for "Bob Team Member" to ₹600</p>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Previous rate: ₹500</p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 rounded text-white font-medium" style={{ backgroundColor: "var(--odoo-primary)" }}>
              <Save size={20} />
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
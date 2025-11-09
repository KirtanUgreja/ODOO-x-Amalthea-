"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { Settings, TrendingUp, ShoppingCart, FileText, Receipt, Wallet, Package, Users, Eye, Edit, Trash2, Plus, Download } from "lucide-react"

export default function FinanceSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [activeTab, setActiveTab] = useState("sales-orders")

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: "sales-orders", label: "Sales Orders", icon: TrendingUp, data: db.salesOrders || [] },
    { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart, data: db.purchaseOrders || [] },
    { id: "invoices", label: "Customer Invoices", icon: FileText, data: db.invoices || [] },
    { id: "vendor-bills", label: "Vendor Bills", icon: Receipt, data: db.vendorBills || [] },
    { id: "expenses", label: "Expenses", icon: Wallet, data: db.expenses || [] },
    { id: "products", label: "Products", icon: Package, data: db.products || [] },
    { id: "partners", label: "Customers & Vendors", icon: Users, data: [...(db.customers || []), ...(db.vendors || [])] },
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const renderTableContent = () => {
    if (!activeTabData || activeTabData.data.length === 0) {
      return (
        <div className="text-center py-12">
          <p style={{ color: "var(--odoo-muted)" }}>No {activeTabData?.label.toLowerCase()} found.</p>
          <p className="mt-4 text-center" style={{ color: "var(--odoo-muted)" }}>
            Use the dedicated pages to create new {activeTabData?.label.toLowerCase()}
          </p>
        </div>
      )
    }

    switch (activeTab) {
      case "sales-orders":
        return (
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>SO Number</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTabData.data.map((so: any, index: number) => {
                const project = db.projects?.find((p: any) => p.id === so.projectId)
                return (
                  <tr key={so.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--odoo-text)" }}>{so.id}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{so.customerName || "Unknown"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{project?.name || "No Project"}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--odoo-text)" }}>₹{so.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${so.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-gray-100" title="View">
                          <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100" title="Edit">
                          <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100" title="Delete">
                          <Trash2 size={16} style={{ color: "#dc3545" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )

      case "purchase-orders":
        return (
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>PO Number</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Vendor</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTabData.data.map((po: any, index: number) => {
                const project = db.projects?.find((p: any) => p.id === po.projectId)
                return (
                  <tr key={po.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--odoo-text)" }}>{po.id}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{po.vendor || "Unknown"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{project?.name || "No Project"}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--odoo-text)" }}>₹{po.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${po.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-gray-100" title="View">
                          <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100" title="Edit">
                          <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100" title="Delete">
                          <Trash2 size={16} style={{ color: "#dc3545" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )

      case "invoices":
        return (
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Invoice #</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTabData.data.map((inv: any, index: number) => {
                const project = db.projects?.find((p: any) => p.id === inv.projectId)
                return (
                  <tr key={inv.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--odoo-text)" }}>INV-{inv.id}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{inv.customerName || "Unknown"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{project?.name || "No Project"}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--odoo-text)" }}>₹{inv.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-gray-100" title="View">
                          <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100" title="Edit">
                          <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100" title="Delete">
                          <Trash2 size={16} style={{ color: "#dc3545" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )

      case "expenses":
        return (
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Expense #</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Employee</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Type</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTabData.data.map((exp: any, index: number) => {
                const employee = db.users?.find((u: any) => u.id === exp.userId)
                return (
                  <tr key={exp.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--odoo-text)" }}>EXP-{exp.id}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{employee?.name || "Unknown"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{exp.description}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--odoo-text)" }}>₹{exp.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${exp.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {exp.billable ? "Billable" : "Non-billable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${exp.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-gray-100" title="View">
                          <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100" title="Edit">
                          <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100" title="Delete">
                          <Trash2 size={16} style={{ color: "#dc3545" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )

      default:
        return (
          <div className="text-center py-12">
            <p style={{ color: "var(--odoo-muted)" }}>Select a category to view documents.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Global Financial Documents
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Organization-wide view of all financial documents (not filtered by project)
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export All
                </button>
              </div>
            </div>
          </div>

          {/* Document Type Tabs */}
          <div className="mb-6">
            <div className="border-b" style={{ borderColor: "var(--odoo-border)" }}>
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        isActive
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                      style={{
                        color: isActive ? "var(--odoo-primary)" : "var(--odoo-muted)",
                        borderBottomColor: isActive ? "var(--odoo-primary)" : "transparent"
                      }}
                    >
                      <Icon size={16} />
                      {tab.label}
                      <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ 
                        backgroundColor: "var(--odoo-light-bg)", 
                        color: "var(--odoo-text)" 
                      }}>
                        {tab.data.length}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Document Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Documents</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>
                    {tabs.reduce((sum, tab) => sum + tab.data.length, 0)}
                  </p>
                </div>
                <Settings size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Category</p>
                  <p className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>
                    {activeTabData?.label}
                  </p>
                </div>
                {activeTabData && <activeTabData.icon size={24} style={{ color: "var(--odoo-accent)" }} />}
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                    ₹{((db.salesOrders || []).reduce((sum: number, so: any) => sum + (so.amount || 0), 0)).toLocaleString()}
                  </p>
                </div>
                <TrendingUp size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Costs</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>
                    ₹{(
                      ((db.purchaseOrders || []).reduce((sum: number, po: any) => sum + (po.amount || 0), 0)) +
                      ((db.expenses || []).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0))
                    ).toLocaleString()}
                  </p>
                </div>
                <ShoppingCart size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Document Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="p-4 border-b" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--odoo-text)" }}>
                {activeTabData?.label} ({activeTabData?.data.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {renderTableContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
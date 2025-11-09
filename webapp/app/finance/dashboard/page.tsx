"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { TrendingUp, DollarSign, FileText, Receipt, ShoppingCart, Users, Package, Wallet } from "lucide-react"

export default function FinanceDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Calculate metrics
  const salesOrders = db.salesOrders || []
  const purchaseOrders = db.purchaseOrders || []
  const invoices = db.invoices || []
  const vendorBills = db.vendorBills || []
  const expenses = db.expenses || []
  const customers = db.customers || []
  const vendors = db.vendors || []
  const products = db.products || []

  const totalRevenue = salesOrders.reduce((sum, so) => sum + (so.amount || 0), 0)
  const totalCosts = purchaseOrders.reduce((sum, po) => sum + (po.amount || 0), 0) + expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const netProfit = totalRevenue - totalCosts
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const pendingInvoices = invoices.filter(inv => inv.status !== 'paid')

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "#28a745", bg: "#d4edda" },
    { label: "Net Profit", value: `₹${netProfit.toLocaleString()}`, icon: DollarSign, color: netProfit >= 0 ? "#28a745" : "#dc3545", bg: netProfit >= 0 ? "#d4edda" : "#f8d7da" },
    { label: "Sales Orders", value: salesOrders.length, icon: FileText, color: "#007bff", bg: "#d1ecf1" },
    { label: "Active Customers", value: customers.length, icon: Users, color: "#6f42c1", bg: "#e2d9f3" },
    { label: "Paid Invoices", value: paidInvoices.length, icon: Receipt, color: "#28a745", bg: "#d4edda" },
    { label: "Pending Invoices", value: pendingInvoices.length, icon: Receipt, color: "#ffc107", bg: "#fff3cd" },
    { label: "Purchase Orders", value: purchaseOrders.length, icon: ShoppingCart, color: "#fd7e14", bg: "#ffeaa7" },
    { label: "Products", value: products.length, icon: Package, color: "#20c997", bg: "#d1f2eb" }
  ]

  const recentSalesOrders = salesOrders.slice(-5).reverse()
  const recentInvoices = invoices.slice(-5).reverse()

  return (
    <div className="flex">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Sales & Finance Dashboard
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Overview of financial performance and key metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{stat.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: stat.bg }}>
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Sales Orders */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Recent Sales Orders</h3>
              <div className="space-y-3">
                {recentSalesOrders.length > 0 ? recentSalesOrders.map((so) => (
                  <div key={so.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div>
                      <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{so.customerName}</p>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{so.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: "var(--odoo-text)" }}>₹{so.amount?.toLocaleString()}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        so.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {so.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-4" style={{ color: "var(--odoo-muted)" }}>No sales orders yet</p>
                )}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Recent Invoices</h3>
              <div className="space-y-3">
                {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div>
                      <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{inv.customerName}</p>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{inv.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: "var(--odoo-text)" }}>₹{inv.amount?.toLocaleString()}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        inv.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-4" style={{ color: "var(--odoo-muted)" }}>No invoices yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/finance/sales-orders')}
                className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--odoo-border)" }}
              >
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--odoo-primary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Sales Orders</p>
              </button>
              <button 
                onClick={() => router.push('/finance/invoices')}
                className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--odoo-border)" }}
              >
                <Receipt className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--odoo-primary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Invoices</p>
              </button>
              <button 
                onClick={() => router.push('/finance/partners')}
                className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--odoo-border)" }}
              >
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--odoo-primary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Customers</p>
              </button>
              <button 
                onClick={() => router.push('/finance/products')}
                className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--odoo-border)" }}
              >
                <Package className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--odoo-primary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Products</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
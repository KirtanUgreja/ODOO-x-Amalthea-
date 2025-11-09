"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar, Filter, Users, Building } from "lucide-react"

export default function FinanceReports() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [dateRange, setDateRange] = useState("this-month")
  const [reportType, setReportType] = useState("overview")

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Calculate financial metrics
  const totalRevenue = (db.invoices || []).reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
  const totalCosts = (db.purchaseOrders || []).reduce((sum: number, po: any) => sum + (po.amount || 0), 0) +
                    (db.vendorBills || []).reduce((sum: number, vb: any) => sum + (vb.amount || 0), 0) +
                    (db.expenses || []).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
  const profit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0

  // Revenue by customer
  const revenueByCustomer = (db.invoices || []).reduce((acc: any, inv: any) => {
    const customer = inv.customerName || "Unknown"
    acc[customer] = (acc[customer] || 0) + (inv.amount || 0)
    return acc
  }, {})

  // Costs by vendor
  const costsByVendor = (db.vendorBills || []).reduce((acc: any, vb: any) => {
    const vendor = vb.vendor || "Unknown"
    acc[vendor] = (acc[vendor] || 0) + (vb.amount || 0)
    return acc
  }, {})

  // Project profitability
  const projectProfitability = (db.projects || []).map((project: any) => {
    const projectRevenue = (db.invoices || [])
      .filter((inv: any) => inv.projectId === project.id)
      .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
    
    const projectCosts = (db.purchaseOrders || [])
      .filter((po: any) => po.projectId === project.id)
      .reduce((sum: number, po: any) => sum + (po.amount || 0), 0) +
      (db.vendorBills || [])
        .filter((vb: any) => vb.projectId === project.id)
        .reduce((sum: number, vb: any) => sum + (vb.amount || 0), 0) +
      (db.expenses || [])
        .filter((exp: any) => exp.projectId === project.id)
        .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    
    return {
      ...project,
      revenue: projectRevenue,
      costs: projectCosts,
      profit: projectRevenue - projectCosts,
      margin: projectRevenue > 0 ? ((projectRevenue - projectCosts) / projectRevenue * 100) : 0
    }
  })

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
                  Financial Reports
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Comprehensive financial analysis and reporting
                </p>
              </div>
              <div className="flex gap-3">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="this-year">This Year</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="last-year">Last Year</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
                  <p className="text-3xl font-bold" style={{ color: "#28a745" }}>₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm mt-1" style={{ color: "#28a745" }}>+12% from last period</p>
                </div>
                <TrendingUp size={32} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Costs</p>
                  <p className="text-3xl font-bold" style={{ color: "#dc3545" }}>₹{totalCosts.toLocaleString()}</p>
                  <p className="text-sm mt-1" style={{ color: "#dc3545" }}>+8% from last period</p>
                </div>
                <TrendingDown size={32} style={{ color: "#dc3545" }} />
              </div>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Net Profit</p>
                  <p className="text-3xl font-bold" style={{ color: profit >= 0 ? "#28a745" : "#dc3545" }}>
                    ₹{profit.toLocaleString()}
                  </p>
                  <p className="text-sm mt-1" style={{ color: profit >= 0 ? "#28a745" : "#dc3545" }}>
                    {profit >= 0 ? "+15%" : "-5%"} from last period
                  </p>
                </div>
                <DollarSign size={32} style={{ color: profit >= 0 ? "#28a745" : "#dc3545" }} />
              </div>
            </div>
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Profit Margin</p>
                  <p className="text-3xl font-bold" style={{ color: profitMargin >= 0 ? "#28a745" : "#dc3545" }}>
                    {profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-sm mt-1" style={{ color: profitMargin >= 0 ? "#28a745" : "#dc3545" }}>
                    {profitMargin >= 20 ? "Excellent" : profitMargin >= 10 ? "Good" : "Needs Improvement"}
                  </p>
                </div>
                <BarChart3 size={32} style={{ color: profitMargin >= 0 ? "#28a745" : "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue by Customer */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
                <Users size={20} />
                Revenue by Customer
              </h3>
              <div className="space-y-3">
                {Object.entries(revenueByCustomer)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([customer, revenue]) => (
                    <div key={customer} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>{customer}</span>
                      <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                        ₹{(revenue as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Costs by Vendor */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
                <Building size={20} />
                Costs by Vendor
              </h3>
              <div className="space-y-3">
                {Object.entries(costsByVendor)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([vendor, cost]) => (
                    <div key={vendor} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>{vendor}</span>
                      <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                        ₹{(cost as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Project Profitability */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <BarChart3 size={20} />
              Project Profitability Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Revenue</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Costs</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Profit</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Margin</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectProfitability.map((project: any, index: number) => (
                    <tr key={project.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--odoo-text)" }}>{project.name}</td>
                      <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>₹{project.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>₹{project.costs.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: project.profit >= 0 ? "#28a745" : "#dc3545" }}>
                        ₹{project.profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: project.margin >= 0 ? "#28a745" : "#dc3545" }}>
                        {project.margin.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: 
                              project.margin >= 20 ? "#d4edda" :
                              project.margin >= 10 ? "#fff3cd" : "#f8d7da",
                            color: 
                              project.margin >= 20 ? "#155724" :
                              project.margin >= 10 ? "#856404" : "#721c24"
                          }}
                        >
                          {project.margin >= 20 ? "Excellent" : project.margin >= 10 ? "Good" : "Poor"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Flow Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Outstanding Receivables</h3>
              <div className="space-y-3">
                {(db.invoices || [])
                  .filter((inv: any) => inv.status === "sent")
                  .slice(0, 5)
                  .map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <div>
                        <p className="font-medium" style={{ color: "var(--odoo-text)" }}>INV-{inv.id}</p>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{inv.customerName}</p>
                      </div>
                      <span className="font-semibold" style={{ color: "#ffc107" }}>
                        ₹{inv.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Outstanding Payables</h3>
              <div className="space-y-3">
                {(db.vendorBills || [])
                  .filter((vb: any) => vb.status === "received")
                  .slice(0, 5)
                  .map((vb: any) => (
                    <div key={vb.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <div>
                        <p className="font-medium" style={{ color: "var(--odoo-text)" }}>BILL-{vb.id}</p>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{vb.vendor}</p>
                      </div>
                      <span className="font-semibold" style={{ color: "#dc3545" }}>
                        ₹{vb.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
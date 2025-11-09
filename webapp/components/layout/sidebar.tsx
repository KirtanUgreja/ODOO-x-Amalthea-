"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, BarChart3, Users, Briefcase, DollarSign, Settings, CheckSquare, Clock, TrendingUp } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export function Sidebar() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  // Use AdminSidebar for admin users
  if (user?.role === "admin") {
    return <AdminSidebar />
  }

  const getNavItems = () => {
    const baseItems = []

    if (user?.role === "project_manager") {
      return [
        { href: "/pm/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/pm/projects", label: "Projects", icon: Briefcase },
        { href: "/pm/tasks", label: "Tasks", icon: CheckSquare },
        { href: "/pm/team", label: "Team", icon: Users },
        { href: "/pm/expenses", label: "Expenses", icon: DollarSign },
        { href: "/pm/timesheets", label: "Timesheets", icon: Clock },
        { href: "/pm/analytics", label: "Analytics", icon: TrendingUp },
      ]
    }

    if (user?.role === "team_member") {
      return [
        { href: "/team/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/team/tasks", label: "My Tasks", icon: Briefcase },
        { href: "/team/timesheets", label: "Timesheets", icon: DollarSign },
        { href: "/team/expenses", label: "Expenses", icon: DollarSign },
      ]
    }

    if (user?.role === "sales_finance") {
      return [
        { href: "/finance/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/finance/sales-orders", label: "Sales Orders", icon: Briefcase },
        { href: "/finance/purchase-orders", label: "Purchase Orders", icon: Briefcase },
        { href: "/finance/invoices", label: "Invoices", icon: DollarSign },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <div className="relative">
      <button
        className="md:hidden fixed top-20 left-4 z-40 p-2 rounded"
        style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`w-60 min-h-screen border-r transition-all ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative`}
        style={{
          backgroundColor: "var(--odoo-card)",
          borderRightColor: "var(--odoo-border)",
        }}
      >
        <nav className="p-4 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded transition-colors"
              style={{
                color: "var(--odoo-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--odoo-light-bg)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}

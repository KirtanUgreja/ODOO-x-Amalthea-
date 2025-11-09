"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useState } from "react"
import { 
  Menu, X, BarChart3, Users, Briefcase, DollarSign, Settings, 
  FileText, Receipt, CreditCard, Wallet, Clock, TrendingUp,
  Shield, Search, Filter, Archive, Eye, AlertTriangle
} from "lucide-react"

export function AdminSidebar() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const adminNavSections = [
    {
      id: 'dashboard',
      label: 'Dashboard & Analytics',
      icon: BarChart3,
      items: [
        { href: '/admin/dashboard', label: 'Main Dashboard', icon: BarChart3 },
        { href: '/admin/analytics', label: 'Advanced Analytics', icon: TrendingUp },
        { href: '/admin/reports', label: 'Custom Reports', icon: FileText },
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      items: [
        { href: '/admin/users', label: 'All Users', icon: Users },
        { href: '/admin/users/create', label: 'Create User', icon: Users },
        { href: '/admin/users/roles', label: 'Role Management', icon: Shield },
        { href: '/admin/users/activity', label: 'User Activity', icon: Eye },
      ]
    },
    {
      id: 'projects',
      label: 'Project Management',
      icon: Briefcase,
      items: [
        { href: '/admin/projects', label: 'All Projects', icon: Briefcase },
        { href: '/admin/projects/create', label: 'Create Project', icon: Briefcase },
        { href: '/admin/projects/templates', label: 'Project Templates', icon: FileText },
        { href: '/admin/projects/archived', label: 'Archived Projects', icon: Archive },
      ]
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: Clock,
      items: [
        { href: '/admin/tasks', label: 'All Tasks', icon: Clock },
        { href: '/admin/tasks/overdue', label: 'Overdue Tasks', icon: AlertTriangle },
        { href: '/admin/timesheets', label: 'All Timesheets', icon: Clock },
        { href: '/admin/timesheets/audit', label: 'Timesheet Audit', icon: Eye },
      ]
    },
    {
      id: 'financial',
      label: 'Financial Management',
      icon: DollarSign,
      items: [
        { href: '/admin/sales-orders', label: 'Sales Orders', icon: FileText },
        { href: '/admin/purchase-orders', label: 'Purchase Orders', icon: Receipt },
        { href: '/admin/invoices', label: 'Customer Invoices', icon: CreditCard },
        { href: '/admin/vendor-bills', label: 'Vendor Bills', icon: Wallet },
        { href: '/admin/expenses', label: 'All Expenses', icon: DollarSign },
      ]
    },
    {
      id: 'system',
      label: 'System & Configuration',
      icon: Settings,
      items: [
        { href: '/admin/settings', label: 'System Settings', icon: Settings },
        { href: '/admin/settings/workflows', label: 'Workflows', icon: Settings },
        { href: '/admin/audit', label: 'Audit Logs', icon: Eye },
      ]
    },
    {
      id: 'tools',
      label: 'Search & Tools',
      icon: Search,
      items: [
        { href: '/admin/search', label: 'Global Search', icon: Search },
        { href: '/admin/filters', label: 'Advanced Filters', icon: Filter },
        { href: '/admin/exports', label: 'Data Export', icon: FileText },
      ]
    }
  ]

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
        className={`w-72 min-h-screen border-r transition-all ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative overflow-y-auto`}
        style={{
          backgroundColor: "var(--odoo-card)",
          borderRightColor: "var(--odoo-border)",
        }}
      >
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>
              Admin Control Panel
            </h2>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
              Full system access & control
            </p>
          </div>

          <nav className="space-y-2">
            {adminNavSections.map((section) => {
              const SectionIcon = section.icon
              const isExpanded = expandedSections.includes(section.id)
              
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor: isExpanded ? "var(--odoo-light-bg)" : "transparent",
                      color: "var(--odoo-text)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor = "var(--odoo-light-bg)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon size={18} />
                      <span className="font-medium text-sm">{section.label}</span>
                    </div>
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm"
                            style={{ color: "var(--odoo-muted)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--odoo-light-bg)"
                              e.currentTarget.style.color = "var(--odoo-text)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent"
                              e.currentTarget.style.color = "var(--odoo-muted)"
                            }}
                          >
                            <ItemIcon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </div>
  )
}
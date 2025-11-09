"use client"

import { Eye, Users, Briefcase, DollarSign, BarChart3 } from "lucide-react"

interface RoleViewSwitcherProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export function RoleViewSwitcher({ currentView, setCurrentView }: RoleViewSwitcherProps) {
  const roleViews = [
    { id: "admin", label: "Admin View", icon: Eye, description: "Full system access" },
    { id: "pm", label: "PM View", icon: Users, description: "Project manager perspective" },
    { id: "team", label: "Team View", icon: Briefcase, description: "Team member perspective" },
    { id: "finance", label: "Finance View", icon: DollarSign, description: "Sales & finance perspective" }
  ]

  return (
    <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 size={20} style={{ color: "var(--odoo-primary)" }} />
        <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>
          Switch Role Perspective
        </h3>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--odoo-muted)" }}>
        View the dashboard from different role perspectives while maintaining admin privileges
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {roleViews.map((view) => {
          const Icon = view.icon
          const isActive = currentView === view.id
          
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                isActive ? 'ring-2' : 'hover:shadow-md'
              }`}
              style={{
                backgroundColor: isActive ? "var(--odoo-primary)" + "10" : "var(--odoo-light-bg)",
                borderColor: isActive ? "var(--odoo-primary)" : "var(--odoo-border)",
                ringColor: isActive ? "var(--odoo-primary)" : "transparent"
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon 
                  size={18} 
                  style={{ color: isActive ? "var(--odoo-primary)" : "var(--odoo-muted)" }} 
                />
                <span 
                  className="font-medium"
                  style={{ color: isActive ? "var(--odoo-primary)" : "var(--odoo-text)" }}
                >
                  {view.label}
                </span>
              </div>
              <p 
                className="text-xs"
                style={{ color: "var(--odoo-muted)" }}
              >
                {view.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
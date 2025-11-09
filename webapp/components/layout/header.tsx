"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Bell, User } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      project_manager: "Project Manager",
      team_member: "Team Member",
      sales_finance: "Sales & Finance",
    }
    return roleMap[role] || role
  }

  return (
    <div
      className="h-16 bg-white border-b flex items-center justify-between px-6"
      style={{
        backgroundColor: "var(--odoo-card)",
        borderBottomColor: "var(--odoo-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: "var(--odoo-primary)" }}
        >
          OF
        </div>
        <span className="font-bold" style={{ color: "var(--odoo-text)" }}>
          OneFlow
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" style={{ color: "var(--odoo-text)" }} />
        </Button>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded"
          style={{
            backgroundColor: "var(--odoo-light-bg)",
            borderColor: "var(--odoo-border)",
          }}
        >
          <User className="w-4 h-4" style={{ color: "var(--odoo-primary)" }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--odoo-text)" }}>
              {user?.name}
            </div>
            <div className="text-xs" style={{ color: "var(--odoo-muted)" }}>
              {getRoleName(user?.role || "")}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          style={{
            borderColor: "var(--odoo-danger)",
            color: "var(--odoo-danger)",
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

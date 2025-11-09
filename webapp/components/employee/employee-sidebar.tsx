"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDb } from "@/hooks/use-db"
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Receipt,
  User,
  LogOut,
  Bell,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  Wallet
} from "lucide-react"

export function EmployeeSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { db } = useDb()

  if (!db || !user) return null

  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user.id)
  const myExpenses = db.expenses.filter((e: any) => e.userId === user.id)
  const pendingExpenses = myExpenses.filter((e: any) => e.status === "pending")
  const overdueTasks = myTasks.filter((t: any) => 
    new Date(t.dueDate) < new Date() && t.status !== "done"
  )
  const activeTasks = myTasks.filter((t: any) => t.status !== "done")

  const navigation = [
    {
      name: "Dashboard",
      href: "/team/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/team/dashboard",
    },
    {
      name: "My Tasks",
      href: "/team/tasks",
      icon: CheckSquare,
      current: pathname.startsWith("/team/tasks"),
      badge: activeTasks.length > 0 ? activeTasks.length : null,
      badgeColor: overdueTasks.length > 0 ? "bg-red-500" : "bg-blue-500"
    },
    {
      name: "Timesheets",
      href: "/team/timesheets",
      icon: Clock,
      current: pathname.startsWith("/team/timesheets"),
    },
    {
      name: "Expenses",
      href: "/team/expenses",
      icon: Receipt,
      current: pathname.startsWith("/team/expenses"),
      badge: pendingExpenses.length > 0 ? pendingExpenses.length : null,
      badgeColor: "bg-orange-500"
    },
    {
      name: "My Projects",
      href: "/team/projects",
      icon: Target,
      current: pathname.startsWith("/team/projects"),
    },
    {
      name: "Work Schedule",
      href: "/team/schedule",
      icon: Calendar,
      current: pathname.startsWith("/team/schedule"),
    },
    {
      name: "Performance",
      href: "/team/performance",
      icon: TrendingUp,
      current: pathname.startsWith("/team/performance"),
    }
  ]

  return (
    <div className="flex h-full w-64 flex-col" style={{ backgroundColor: "var(--odoo-sidebar)" }}>
      <div className="flex h-16 items-center px-6" style={{ borderBottom: "1px solid var(--odoo-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--odoo-primary)" }}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--odoo-text)" }}>
              Employee Portal
            </h2>
            <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
              {user.name}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.name}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                item.current && "bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge 
                  className={cn("text-xs px-2 py-0.5 text-white", item.badgeColor)}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="px-4 py-4 space-y-2" style={{ borderTop: "1px solid var(--odoo-border)" }}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10"
          onClick={() => router.push("/team/profile")}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10"
          onClick={() => router.push("/team/notifications")}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            logout()
            router.push("/login")
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <div className="px-4 py-3" style={{ 
        borderTop: "1px solid var(--odoo-border)",
        backgroundColor: "var(--odoo-light-bg)"
      }}>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span style={{ color: "var(--odoo-muted)" }}>Role:</span>
            <span style={{ color: "var(--odoo-text)" }}>Team Member</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--odoo-muted)" }}>Rate:</span>
            <span style={{ color: "var(--odoo-text)" }}>₹{user.hourlyRate}/hr</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--odoo-muted)" }}>Active Tasks:</span>
            <span style={{ color: "var(--odoo-text)" }}>{activeTasks.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
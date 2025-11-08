"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  ShoppingCart,
  FileText,
  Receipt,
  DollarSign,
  Menu,
  X,
  Clock
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { UserRole, User } from "@/lib/types"

interface OneFlowLayoutProps {
  children: React.ReactNode
  currentUser: User
  onLogout: () => void
  activeView: string
  onNavigate: (view: string) => void
}

export function OneFlowLayout({ 
  children, 
  currentUser, 
  onLogout, 
  activeView, 
  onNavigate 
}: OneFlowLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "project_manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "team_member": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "sales_finance": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case "admin": return "Admin"
      case "project_manager": return "Project Manager"
      case "team_member": return "Employee"
      case "sales_finance": return "Finance"
      default: return "User"
    }
  }

  const mainNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "project_manager", "team_member", "sales_finance"]
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      roles: ["admin", "project_manager", "team_member"]
    },
    {
      id: "tasks", 
      label: "Tasks",
      icon: CheckSquare,
      roles: ["admin", "project_manager", "team_member"]
    },
    {
      id: "timesheets",
      label: "Timesheets",
      icon: Clock,
      roles: ["admin", "project_manager", "team_member"]
    },
    {
      id: "analytics",
      label: "Analytics", 
      icon: BarChart3,
      roles: ["admin", "project_manager", "sales_finance"]
    }
  ]

  const settingsNavItems = [
    {
      id: "sales-orders",
      label: "Sales Orders",
      icon: ShoppingCart,
      roles: ["admin", "project_manager", "sales_finance"]
    },
    {
      id: "purchase-orders",
      label: "Purchase Orders",
      icon: FileText,
      roles: ["admin", "project_manager", "sales_finance"]
    },
    {
      id: "customer-invoices",
      label: "Customer Invoices",
      icon: Receipt,
      roles: ["admin", "sales_finance"]
    },
    {
      id: "vendor-bills",
      label: "Vendor Bills",
      icon: FileText,
      roles: ["admin", "sales_finance"]
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: DollarSign,
      roles: ["admin", "project_manager", "team_member", "sales_finance"]
    }
  ]

  const profileItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: UserIcon,
      roles: ["admin", "project_manager", "team_member", "sales_finance"]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin", "project_manager"]
    }
  ]

  const filterItemsByRole = (items: any[]) => {
    return items.filter(item => item.roles.includes(currentUser.role))
  }

  const NavItem = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  )

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">OneFlow</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-6 px-4 py-6">
        {/* Main Navigation */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </div>
          <div className="space-y-1">
            {filterItemsByRole(mainNavItems).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setSidebarOpen(false)
                }}
              />
            ))}
          </div>
        </div>

        {/* Financial Navigation */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Financial Documents
          </div>
          <div className="space-y-1">
            {filterItemsByRole(settingsNavItems).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setSidebarOpen(false)
                }}
              />
            ))}
          </div>
        </div>

        {/* Profile Navigation */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Profile
          </div>
          <div className="space-y-1">
            {filterItemsByRole(profileItems).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setSidebarOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start p-3">
              <div className="flex w-full min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">{currentUser.name}</div>
                  <Badge className={`${getRoleColor(currentUser.role)} mt-1 text-xs`} variant="secondary">
                    {getRoleName(currentUser.role)}
                  </Badge>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate("profile")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="border-b bg-background px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            {/* Role-specific welcome message */}
            <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Welcome back, {currentUser.name}!</h2>
                  <p className="text-sm text-muted-foreground">
                    Logged in as {getRoleName(currentUser.role)} • {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

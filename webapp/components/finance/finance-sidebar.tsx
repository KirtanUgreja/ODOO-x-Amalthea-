"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Settings, 
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Users,
  Package
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/finance/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sales Orders",
    href: "/finance/sales-orders",
    icon: TrendingUp,
  },
  {
    title: "Purchase Orders", 
    href: "/finance/purchase-orders",
    icon: ShoppingCart,
  },
  {
    title: "Customer Invoices",
    href: "/finance/invoices",
    icon: FileText,
  },
  {
    title: "Vendor Bills",
    href: "/finance/vendor-bills", 
    icon: Receipt,
  },
  {
    title: "Expenses",
    href: "/finance/expenses",
    icon: Wallet,
  },
  {
    title: "Customers & Vendors",
    href: "/finance/partners",
    icon: Users,
  },
  {
    title: "Products",
    href: "/finance/products",
    icon: Package,
  },
  {
    title: "Reports",
    href: "/finance/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/finance/settings",
    icon: Settings,
  },
]

export function FinanceSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen border-r" style={{ backgroundColor: "var(--odoo-sidebar)", borderColor: "var(--odoo-border)" }}>
      <div className="p-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--odoo-text)" }}>
          Sales & Finance
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--odoo-muted)" }}>
          Financial Management
        </p>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : "hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor: isActive ? "var(--odoo-primary)" : "transparent",
                    color: isActive ? "white" : "var(--odoo-text)",
                  }}
                >
                  <Icon size={18} />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
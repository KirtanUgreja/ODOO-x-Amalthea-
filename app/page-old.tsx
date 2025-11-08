"use client"
import { useState } from "react"
import { useData } from "@/lib/data-context"
import { AuthPage } from "@/components/auth-page"
import { OneFlowLayout } from "@/components/oneflow-layout"
import { ProjectDashboard } from "@/components/project-dashboard"
import { ProjectDetails } from "@/components/project-details"
import { TaskManager } from "@/components/task-manager"
import { TimesheetManager } from "@/components/timesheet-manager"
import { SalesOrderManager } from "@/components/sales-order-manager"
import { PurchaseOrderManager } from "@/components/purchase-order-manager"
import { CustomerInvoiceManager } from "@/components/customer-invoice-manager"
import { VendorBillManager } from "@/components/vendor-bill-manager"
import { ExpenseManager } from "@/components/expense-manager"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { UserProfile } from "@/components/user-profile"
import { AppSettings } from "@/components/app-settings"
import { TeamMemberDashboard } from "@/components/team-member-dashboard"
import { FinanceDashboard } from "@/components/finance-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard-new"
import { ClientOnly } from "@/components/client-only"
import type { Project, User } from "@/lib/types"

export default function Home() {
  return (
    <ClientOnly>
      <MainContent />
    </ClientOnly>
  )
}

function MainContent() {
  const { currentUser, isHydrated, logout } = useData()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Show loading until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading OneFlow...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <AuthPage />
  }

  const handleLogout = () => {
    logout()
    setActiveView("dashboard")
    setSelectedProject(null)
  }

  const handleNavigate = (view: string) => {
    setActiveView(view)
    if (view !== "project-details") {
      setSelectedProject(null)
    }
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setActiveView("project-details")
  }

  const handleCreateProject = () => {
    // TODO: Implement project creation modal
    console.log("Create new project")
  }

  const renderContent = () => {
    // Role-based dashboard rendering
    switch (currentUser.role) {
      case 'team_member':
        return <TeamMemberDashboard />
      
      case 'sales_finance':
        return <FinanceDashboard />
      
      case 'admin':
        return <AdminDashboard />
      
      case 'project_manager':
      default:
        // Project Manager Dashboard (existing functionality)
        break;
    }

    // Mock data for development (Project Manager Dashboard)
    const mockProjects: Project[] = [
      {
        id: "1",
        name: "Website Redesign",
        description: "Complete overhaul of company website with modern UI/UX",
        status: "in_progress",
        managerId: currentUser.id,
        teamMemberIds: ["1", "2", "3"],
        startDate: "2024-01-15",
        endDate: "2024-04-15",
        budget: 50000,
        currency: "USD",
        companyId: currentUser.companyId,
        progress: 65,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-20"
      },
      {
        id: "2",
        name: "Mobile App Development",
        description: "Native mobile application for iOS and Android",
        status: "planned",
        managerId: currentUser.id,
        teamMemberIds: ["2", "4"],
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        budget: 80000,
        currency: "USD",
        companyId: currentUser.companyId,
        progress: 15,
        createdAt: "2024-01-05",
        updatedAt: "2024-01-25"
      }
    ]

    switch (activeView) {
      case "dashboard":
        return (
          <ProjectDashboard
            projects={mockProjects}
            onProjectClick={handleProjectClick}
            onCreateProject={handleCreateProject}
          />
        )
      case "projects":
        return (
          <ProjectDashboard
            projects={mockProjects}
            onProjectClick={handleProjectClick}
            onCreateProject={handleCreateProject}
          />
        )
      case "project-details":
        return selectedProject ? (
          <ProjectDetails
            project={selectedProject}
            tasks={[]}
            salesOrders={[]}
            purchaseOrders={[]}
            customerInvoices={[]}
            vendorBills={[]}
            expenses={[]}
            timesheets={[]}
            onBack={() => handleNavigate("projects")}
            onEditProject={() => console.log("Edit project")}
            onCreateTask={() => console.log("Create task")}
            onTaskClick={(task) => console.log("Task clicked", task)}
          />
        ) : (
          <div>Project not found</div>
        )
      case "tasks":
        return <TaskManager />
      case "timesheets":
        return <TimesheetManager />
      case "sales-orders":
        return <SalesOrderManager />
      case "purchase-orders":
        return <PurchaseOrderManager />
      case "customer-invoices":
        return <CustomerInvoiceManager />
      case "vendor-bills":
        return <VendorBillManager />
      case "expenses":
        return <ExpenseManager />
      case "analytics":
        return <AnalyticsDashboard />
      case "profile":
        return <UserProfile user={currentUser} />
      case "settings":
        return <AppSettings />
      default:
        return (
          <ProjectDashboard
            projects={mockProjects}
            onProjectClick={handleProjectClick}
            onCreateProject={handleCreateProject}
          />
        )
    }
  }

  return (
    <OneFlowLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      activeView={activeView}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </OneFlowLayout>
  )
}

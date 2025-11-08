export type UserRole = "admin" | "project_manager" | "team_member" | "sales_finance"

export type ProjectStatus = "planned" | "in_progress" | "completed" | "on_hold"
export type TaskStatus = "new" | "in_progress" | "blocked" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type DocumentStatus = "draft" | "pending" | "confirmed" | "paid" | "cancelled"

export type Currency = string

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  hourlyRate?: number // For timesheets calculation
  createdAt: string
  password?: string
}

export interface Company {
  id: string
  name: string
  currency: Currency
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  managerId: string // Project Manager
  teamMemberIds: string[]
  startDate: string
  endDate: string
  budget: number
  currency: Currency
  companyId: string
  progress: number // 0-100
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  createdBy: string
  dueDate: string
  estimatedHours?: number
  actualHours: number
  createdAt: string
  updatedAt: string
  comments: TaskComment[]
  attachments: string[]
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface Timesheet {
  id: string
  taskId: string
  userId: string
  userName: string
  projectId: string
  date: string
  hours: number
  description: string
  isBillable: boolean
  hourlyRate: number
  createdAt: string
}

export interface SalesOrder {
  id: string
  projectId?: string
  customerName: string
  customerEmail: string
  amount: number
  currency: Currency
  description: string
  status: DocumentStatus
  orderDate: string
  deliveryDate: string
  createdAt: string
}

export interface PurchaseOrder {
  id: string
  projectId?: string
  vendorName: string
  vendorEmail: string
  amount: number
  currency: Currency
  description: string
  status: DocumentStatus
  orderDate: string
  expectedDate: string
  createdAt: string
}

export interface CustomerInvoice {
  id: string
  projectId?: string
  salesOrderId?: string
  customerName: string
  customerEmail: string
  amount: number
  currency: Currency
  description: string
  status: DocumentStatus
  invoiceDate: string
  dueDate: string
  createdAt: string
}

export interface VendorBill {
  id: string
  projectId?: string
  purchaseOrderId?: string
  vendorName: string
  vendorEmail: string
  amount: number
  currency: Currency
  description: string
  status: DocumentStatus
  billDate: string
  dueDate: string
  createdAt: string
}

export interface Expense {
  id: string
  projectId?: string
  userId: string
  userName: string
  amount: number
  currency: Currency
  category: string
  description: string
  date: string
  status: "pending" | "approved" | "rejected"
  isBillable: boolean
  receiptUrl?: string
  ocrData?: OCRData
  createdAt: string
}

export interface OCRData {
  merchantName?: string
  amount?: number
  currency?: Currency
  date?: string
  category?: string
  items?: string[]
  confidence?: number
}

export interface EmailNotification {
  id: string
  to: string
  subject: string
  body: string
  timestamp: string
  type: "credentials" | "expense_submitted" | "expense_approved" | "expense_rejected"
}

export interface Country {
  name: string
  currencies: Record<string, { name: string; symbol: string }>
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DollarSign, 
  FileText, 
  Receipt, 
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

export function FinanceDashboard() {
  // Mock financial data
  const financialStats = {
    totalSalesOrders: 45,
    pendingInvoices: 12,
    vendorBills: 8,
    totalExpenses: 23450
  }

  const mockTransactions = [
    {
      id: "1",
      date: "2024-11-08",
      type: "Sales Order",
      partner: "Acme Corp",
      amount: 15000,
      status: "completed"
    },
    {
      id: "2", 
      date: "2024-11-07",
      type: "Vendor Bill",
      partner: "Office Supplies Ltd",
      amount: -2500,
      status: "pending"
    },
    {
      id: "3",
      date: "2024-11-06",
      type: "Invoice",
      partner: "Tech Solutions Inc",
      amount: 8750,
      status: "paid"
    },
    {
      id: "4",
      type: "Expense",
      date: "2024-11-05",
      partner: "Marketing Agency",
      amount: -3200,
      status: "approved"
    },
    {
      id: "5",
      date: "2024-11-04",
      type: "Sales Order",
      partner: "Global Industries",
      amount: 22000,
      status: "completed"
    }
  ]

  const revenueData = [
    { month: "Jan", revenue: 45000, cost: 32000 },
    { month: "Feb", revenue: 52000, cost: 35000 },
    { month: "Mar", revenue: 48000, cost: 33000 },
    { month: "Apr", revenue: 61000, cost: 42000 },
    { month: "May", revenue: 55000, cost: 38000 },
    { month: "Jun", revenue: 67000, cost: 45000 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Sales Order": return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Invoice": return <FileText className="h-4 w-4 text-blue-600" />
      case "Vendor Bill": return <Receipt className="h-4 w-4 text-orange-600" />
      case "Expense": return <DollarSign className="h-4 w-4 text-red-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="dashboard-container space-y-8">
      {/* Finance Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard 💰</h1>
          <p className="mt-2 text-muted-foreground">Financial overview and transaction management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Create Sales Order
          </Button>
          <Button variant="outline" className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          <Button className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="stats-grid grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.totalSalesOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.vendorBills}</div>
            <p className="text-xs text-muted-foreground">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialStats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
              -5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Cost Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Revenue vs Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <div className="w-12 text-sm font-medium">{data.month}</div>
                <div className="flex-1 mx-4">
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 opacity-70"
                      style={{ width: `${(data.revenue / 70000) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-red-500 opacity-50"
                      style={{ width: `${(data.cost / 70000) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-green-600 font-medium">${(data.revenue / 1000).toFixed(0)}k</div>
                  <div className="text-red-600">${(data.cost / 1000).toFixed(0)}k</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Cost</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {transaction.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      {transaction.type}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.partner}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month:</span>
                <span className="font-medium text-green-600">$185,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Month:</span>
                <span className="font-medium">$165,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Growth:</span>
                <span className="font-medium text-green-600">+12.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
              Accounts Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due This Week:</span>
                <span className="font-medium text-red-600">$45,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Next Week:</span>
                <span className="font-medium">$32,800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Overdue:</span>
                <span className="font-medium text-red-600">$8,500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              Accounts Receivable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Outstanding:</span>
                <span className="font-medium text-orange-600">$78,900</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Collected:</span>
                <span className="font-medium text-green-600">$142,100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Collection Rate:</span>
                <span className="font-medium">64.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

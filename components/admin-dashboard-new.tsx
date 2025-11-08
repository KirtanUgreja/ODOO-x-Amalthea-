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
  Shield, 
  Users, 
  FolderOpen, 
  DollarSign,
  TrendingUp,
  Settings,
  Activity,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle
} from "lucide-react"

export function AdminDashboard() {
  // Mock admin data
  const adminStats = {
    totalProjects: 24,
    totalUsers: 156,
    revenue: 2450000,
    profit: 645000
  }

  const mockProjects = [
    {
      id: "1",
      name: "Website Redesign",
      manager: "Sarah Johnson",
      status: "in_progress",
      profitMargin: 28.5,
      budget: 85000,
      spent: 62000
    },
    {
      id: "2",
      name: "Mobile App Development", 
      manager: "Mike Chen",
      status: "completed",
      profitMargin: 35.2,
      budget: 120000,
      spent: 95000
    },
    {
      id: "3",
      name: "API Integration",
      manager: "Alex Rodriguez",
      status: "planning",
      profitMargin: 42.1,
      budget: 65000,
      spent: 15000
    },
    {
      id: "4",
      name: "Data Migration",
      manager: "Emma Davis",
      status: "on_hold",
      profitMargin: 15.8,
      budget: 45000,
      spent: 38000
    },
    {
      id: "5",
      name: "Security Audit",
      manager: "David Kim",
      status: "in_progress",
      profitMargin: 48.3,
      budget: 75000,
      spent: 32000
    }
  ]

  const mockActivityFeed = [
    {
      id: "1",
      user: "Sarah Johnson",
      action: "created new project",
      target: "Website Redesign v2",
      timestamp: "2 minutes ago",
      type: "project"
    },
    {
      id: "2",
      user: "Mike Chen",
      action: "approved expense",
      target: "$2,450 - Office Equipment",
      timestamp: "15 minutes ago",
      type: "expense"
    },
    {
      id: "3",
      user: "Admin System",
      action: "generated report",
      target: "Monthly Revenue Report",
      timestamp: "1 hour ago",
      type: "system"
    },
    {
      id: "4",
      user: "Emma Davis",
      action: "completed task",
      target: "Database Schema Review",
      timestamp: "2 hours ago",
      type: "task"
    },
    {
      id: "5",
      user: "Alex Rodriguez",
      action: "updated user permissions",
      target: "Finance Team Access",
      timestamp: "3 hours ago",
      type: "user"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "planning": return "bg-purple-100 text-purple-800"
      case "on_hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getProfitColor = (profit: number) => {
    if (profit >= 40) return "text-green-600"
    if (profit >= 25) return "text-blue-600"
    if (profit >= 15) return "text-orange-600"
    return "text-red-600"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project": return <FolderOpen className="h-4 w-4 text-blue-600" />
      case "expense": return <DollarSign className="h-4 w-4 text-green-600" />
      case "system": return <Settings className="h-4 w-4 text-gray-600" />
      case "task": return <Activity className="h-4 w-4 text-purple-600" />
      case "user": return <UserCheck className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="dashboard-container space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview 🛡️</h1>
          <p className="mt-2 text-muted-foreground">System administration and company insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-fit">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
          <Button className="w-fit">
            <UserCheck className="mr-2 h-4 w-4" />
            Manage Roles & Permissions
          </Button>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="stats-grid grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(adminStats.revenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Total company revenue
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(adminStats.profit / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              Net profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Summary Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Profit %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {project.manager.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {project.manager}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${project.budget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${project.spent.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getProfitColor(project.profitMargin)}`}>
                    {project.profitMargin.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Feed and User Management */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivityFeed.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">API Services</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Backup System</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Security</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Secure</Badge>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Server Uptime:</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Last Backup:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-medium">89 online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-muted-foreground">View detailed reports and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">System Config</h3>
                <p className="text-sm text-muted-foreground">Configure system settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

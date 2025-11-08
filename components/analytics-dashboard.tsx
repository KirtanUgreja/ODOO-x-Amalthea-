"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  PieChart,
  Calendar,
  Filter
} from "lucide-react"

interface AnalyticsDashboardProps {
  projectId?: string
}

export function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedProject, setSelectedProject] = useState(projectId || "all")

  // Mock analytics data
  const projectMetrics = {
    totalProjects: 5,
    activeProjects: 3,
    completedProjects: 2,
    totalBudget: 250000,
    spentBudget: 158750,
    projectsOnTime: 80,
    averageProgress: 65
  }

  const financialMetrics = {
    totalRevenue: 187500,
    totalExpenses: 45230,
    netProfit: 142270,
    billableHours: 1250,
    nonBillableHours: 380,
    averageHourlyRate: 75,
    outstandingInvoices: 35000,
    overdueInvoices: 8500
  }

  const teamMetrics = {
    totalTeamMembers: 12,
    activeMembers: 8,
    totalHoursLogged: 1630,
    averageHoursPerMember: 136,
    topPerformer: "Jane Smith",
    productivityScore: 92
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  const getChangeIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Header - Enhanced with better spacing and controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project performance and insights" : "Business intelligence and reporting"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          {!projectId && (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="1">Website Redesign</SelectItem>
                <SelectItem value="2">Mobile App</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.3% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectMetrics.activeProjects}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {projectMetrics.totalProjects} total projects
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMetrics.activeMembers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {teamMetrics.totalTeamMembers} total members
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMetrics.totalHoursLogged}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress Overview</CardTitle>
                <CardDescription>Current status of active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Website Redesign</span>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mobile App Development</span>
                    <span className="text-sm text-muted-foreground">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Integration</span>
                    <span className="text-sm text-muted-foreground">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Revenue, expenses, and profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="text-sm font-medium">${financialMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Expenses</span>
                    <span className="text-sm font-medium">${financialMetrics.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Net Profit</span>
                      <span className="text-sm font-bold text-green-600">${financialMetrics.netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Profit Margin</span>
                      <span>{((financialMetrics.netProfit / financialMetrics.totalRevenue) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((projectMetrics.spentBudget / projectMetrics.totalBudget) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  ${projectMetrics.spentBudget.toLocaleString()} of ${projectMetrics.totalBudget.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectMetrics.projectsOnTime}%</div>
                <div className="text-xs text-muted-foreground">
                  Projects delivered on schedule
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectMetrics.averageProgress}%</div>
                <div className="text-xs text-muted-foreground">
                  Across all active projects
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics.billableHours}</div>
                <div className="text-xs text-muted-foreground">
                  ${(financialMetrics.billableHours * financialMetrics.averageHourlyRate).toLocaleString()} revenue
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.averageHourlyRate}</div>
                <div className="text-xs text-muted-foreground">
                  Per hour
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.outstandingInvoices.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Pending invoices
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${financialMetrics.overdueInvoices.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Past due date
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Hours/Member</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMetrics.averageHoursPerMember}</div>
                <div className="text-xs text-muted-foreground">
                  This period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{teamMetrics.topPerformer}</div>
                <div className="text-xs text-muted-foreground">
                  Most hours logged
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMetrics.productivityScore}%</div>
                <div className="text-xs text-green-600">
                  +5% from last period
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

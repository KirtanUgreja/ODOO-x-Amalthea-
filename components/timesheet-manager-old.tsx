"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } fro      {/* Header - Enhanced with better spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Time Tracking</h1>
          <p className="text-lg text-muted-foreground">
            {projectId ? "Project time tracking and billing" : "Manage all timesheet entries"}
          </p>
        </div>
        <Button onClick={onCreateTimesheet} size="lg" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Time
        </Button>
      </div>ts/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Plus, 
  Clock,
  Calendar as CalendarIcon,
  DollarSign,
  Filter,
  FileText,
  Search
} from "lucide-react"
import { format } from "date-fns"
import type { Timesheet } from "@/lib/types"

interface TimesheetManagerProps {
  projectId?: string
  timesheets?: Timesheet[]
  onTimesheetClick?: (timesheet: Timesheet) => void
  onCreateTimesheet?: () => void
}

export function TimesheetManager({ 
  projectId, 
  timesheets = [], 
  onTimesheetClick, 
  onCreateTimesheet 
}: TimesheetManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<Date>()
  const [billableFilter, setBillableFilter] = useState<"all" | "billable" | "non-billable">("all")

  // Mock data if no timesheets provided
  const mockTimesheets: Timesheet[] = [
    {
      id: "1",
      taskId: "1",
      userId: "user-1",
      userName: "John Doe",
      projectId: projectId || "1",
      date: "2024-01-20",
      hours: 8,
      description: "Worked on landing page design and user flow wireframes",
      isBillable: true,
      hourlyRate: 75,
      createdAt: "2024-01-20T08:00:00Z"
    },
    {
      id: "2",
      taskId: "2",
      userId: "user-2",
      userName: "Jane Smith",
      projectId: projectId || "1",
      date: "2024-01-19",
      hours: 6,
      description: "Implemented user authentication backend services",
      isBillable: true,
      hourlyRate: 85,
      createdAt: "2024-01-19T09:00:00Z"
    },
    {
      id: "3",
      taskId: "1",
      userId: "user-1",
      userName: "John Doe",
      projectId: projectId || "1",
      date: "2024-01-18",
      hours: 4,
      description: "Team meeting and project planning session",
      isBillable: false,
      hourlyRate: 75,
      createdAt: "2024-01-18T14:00:00Z"
    }
  ]

  const displayTimesheets = timesheets.length > 0 ? timesheets : mockTimesheets
  
  const filteredTimesheets = displayTimesheets.filter(timesheet => {
    const matchesSearch = timesheet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || 
                       new Date(timesheet.date).toDateString() === dateFilter.toDateString()
    
    const matchesBillable = billableFilter === "all" || 
                           (billableFilter === "billable" && timesheet.isBillable) ||
                           (billableFilter === "non-billable" && !timesheet.isBillable)
    
    if (projectId) {
      return timesheet.projectId === projectId && matchesSearch && matchesDate && matchesBillable
    }
    
    return matchesSearch && matchesDate && matchesBillable
  })

  const getTimesheetStats = () => {
    const total = filteredTimesheets.reduce((sum, ts) => sum + ts.hours, 0)
    const billable = filteredTimesheets
      .filter(ts => ts.isBillable)
      .reduce((sum, ts) => sum + ts.hours, 0)
    const revenue = filteredTimesheets
      .filter(ts => ts.isBillable)
      .reduce((sum, ts) => sum + (ts.hours * ts.hourlyRate), 0)
    const entries = filteredTimesheets.length
    
    return { total, billable, revenue, entries }
  }

  const stats = getTimesheetStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project time tracking and billing" : "Track time across all projects"}
          </p>
        </div>
        <Button onClick={onCreateTimesheet} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Time
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.billable.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search timesheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[200px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
            <div className="p-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateFilter(undefined)}
                className="w-full"
              >
                Clear Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={billableFilter} onValueChange={(value: "all" | "billable" | "non-billable") => setBillableFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="billable">Billable Only</SelectItem>
            <SelectItem value="non-billable">Non-billable Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timesheet List */}
      <div className="grid gap-4">
        {filteredTimesheets.map((timesheet) => (
          <Card 
            key={timesheet.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onTimesheetClick?.(timesheet)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{timesheet.userName}</CardTitle>
                    <Badge variant={timesheet.isBillable ? "default" : "secondary"}>
                      {timesheet.isBillable ? "Billable" : "Non-billable"}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {timesheet.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{timesheet.hours}h</div>
                  {timesheet.isBillable && (
                    <div className="text-sm text-muted-foreground">
                      ${timesheet.hourlyRate}/hr
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{new Date(timesheet.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Task: {timesheet.taskId}</span>
                  </div>
                </div>
                {timesheet.isBillable && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${(timesheet.hours * timesheet.hourlyRate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTimesheets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No timesheets found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || dateFilter || billableFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Start tracking time by logging your first timesheet entry."}
            </p>
            <Button onClick={onCreateTimesheet}>Log Time</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

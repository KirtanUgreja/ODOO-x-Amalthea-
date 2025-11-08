"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Search,
  User,
  TrendingUp,
  PlayCircle
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
      id: "TS-001",
      taskId: "TASK-001",
      userId: "user-1",
      userName: "John Doe",
      projectId: projectId || "1",
      date: "2024-01-20",
      hours: 8.5,
      description: "Worked on landing page design and user flow wireframes. Completed responsive layout for mobile devices.",
      isBillable: true,
      hourlyRate: 75,
      createdAt: "2024-01-20T18:00:00Z"
    },
    {
      id: "TS-002",
      taskId: "TASK-002",
      userId: "user-2",
      userName: "Jane Smith",
      projectId: projectId || "1",
      date: "2024-01-19",
      hours: 6.0,
      description: "Implemented user authentication backend API endpoints and JWT token management.",
      isBillable: true,
      hourlyRate: 85,
      createdAt: "2024-01-19T17:30:00Z"
    },
    {
      id: "TS-003",
      taskId: "TASK-003",
      userId: "user-3",
      userName: "Mike Johnson",
      projectId: projectId || "2",
      date: "2024-01-18",
      hours: 4.5,
      description: "Database schema design and optimization. Created ER diagrams and migration scripts.",
      isBillable: false,
      hourlyRate: 70,
      createdAt: "2024-01-18T16:15:00Z"
    },
    {
      id: "TS-004",
      taskId: "TASK-001",
      userId: "user-1",
      userName: "John Doe",
      projectId: projectId || "1",
      date: "2024-01-22",
      hours: 7.5,
      description: "Continued work on landing page animations and micro-interactions. Fixed responsive issues on tablet.",
      isBillable: true,
      hourlyRate: 75,
      createdAt: "2024-01-22T19:00:00Z"
    },
    {
      id: "TS-005",
      taskId: "TASK-004",
      userId: "user-2",
      userName: "Jane Smith",
      projectId: projectId || "1",
      date: "2024-01-21",
      hours: 5.5,
      description: "REST API development for project management. Implemented CRUD operations and error handling.",
      isBillable: true,
      hourlyRate: 85,
      createdAt: "2024-01-21T18:30:00Z"
    }
  ]

  const displayTimesheets = timesheets.length > 0 ? timesheets : mockTimesheets
  
  const filteredTimesheets = displayTimesheets.filter(timesheet => {
    const matchesSearch = timesheet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.id.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    const totalEntries = filteredTimesheets.length
    const totalHours = filteredTimesheets.reduce((sum, timesheet) => sum + timesheet.hours, 0)
    const billableHours = filteredTimesheets
      .filter(timesheet => timesheet.isBillable)
      .reduce((sum, timesheet) => sum + timesheet.hours, 0)
    const billableValue = filteredTimesheets
      .filter(timesheet => timesheet.isBillable)
      .reduce((sum, timesheet) => sum + (timesheet.hours * (timesheet.hourlyRate || 0)), 0)
    const avgHoursPerDay = totalHours / Math.max(1, new Set(filteredTimesheets.map(t => t.date)).size)
    
    return { totalEntries, totalHours, billableHours, billableValue, avgHoursPerDay }
  }

  const stats = getTimesheetStats()

  return (
    <div className="space-y-4">
      {/* Header - Reduced spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Time Tracking</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project time tracking and billing" : "Manage all timesheet entries"}
          </p>
        </div>
        <Button onClick={onCreateTimesheet} size="default" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Time
        </Button>
      </div>

      {/* Stats Cards - Enhanced with better layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Entries</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Time entries logged
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Hours</CardTitle>
            <Clock className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Billable Hours</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats.billableHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Client chargeable
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Billable Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${stats.billableValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue potential
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Daily Average</CardTitle>
            <PlayCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.avgHoursPerDay.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hours per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
            <Button variant="outline" className="w-full lg:w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Select value={billableFilter} onValueChange={(value: "all" | "billable" | "non-billable") => setBillableFilter(value)}>
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Filter by billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="billable">Billable</SelectItem>
            <SelectItem value="non-billable">Non-billable</SelectItem>
          </SelectContent>
        </Select>
        
        {dateFilter && (
          <Button 
            variant="outline" 
            onClick={() => setDateFilter(undefined)}
            className="w-full lg:w-auto"
          >
            Clear Date
          </Button>
        )}
      </div>

      {/* Timesheet List - Enhanced layout */}
      <div className="space-y-4">
        {filteredTimesheets.map((timesheet) => (
          <Card 
            key={timesheet.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={() => onTimesheetClick?.(timesheet)}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {timesheet.id}
                    </CardTitle>
                    {timesheet.isBillable ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Billable
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Non-billable
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {timesheet.description}
                  </CardDescription>
                </div>
                <div className="text-right sm:text-right min-w-fit">
                  <div className="text-2xl font-bold text-foreground">
                    {timesheet.hours}h
                  </div>
                  {timesheet.isBillable && timesheet.hourlyRate && (
                    <div className="text-sm text-muted-foreground font-medium">
                      ${(timesheet.hours * timesheet.hourlyRate).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{timesheet.userName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(timesheet.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      weekday: 'short'
                    })}</span>
                  </div>
                  {timesheet.hourlyRate && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${timesheet.hourlyRate}/hr</span>
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  Logged: {new Date(timesheet.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTimesheets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No timesheet entries found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || dateFilter || billableFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Start logging your time to track project hours."}
            </p>
            <Button onClick={onCreateTimesheet}>Log Time</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

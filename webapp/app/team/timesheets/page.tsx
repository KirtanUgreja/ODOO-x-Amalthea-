"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Clock, 
  Plus, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign,
  Edit,
  Trash2,
  Filter
} from "lucide-react"
import { format } from "date-fns"

export default function EmployeeTimesheetsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTask, setSelectedTask] = useState("")
  const [hours, setHours] = useState("")
  const [billable, setBillable] = useState("true")
  const [notes, setNotes] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("this_month")
  const [editingTimesheet, setEditingTimesheet] = useState<any>(null)

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))
  const myTimesheets = db.timesheets.filter((ts: any) => ts.userId === user?.id)

  // Filter timesheets based on selected period
  const getFilteredTimesheets = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    return myTimesheets.filter((ts: any) => {
      const tsDate = new Date(ts.date)
      switch (filterPeriod) {
        case "today":
          return tsDate.toDateString() === new Date().toDateString()
        case "this_week":
          return tsDate >= startOfWeek
        case "this_month":
          return tsDate >= startOfMonth
        case "this_year":
          return tsDate >= startOfYear
        default:
          return true
      }
    })
  }

  const filteredTimesheets = getFilteredTimesheets()
  const totalHours = filteredTimesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0)
  const billableHours = filteredTimesheets.filter((ts: any) => ts.billable).reduce((sum: number, ts: any) => sum + ts.hours, 0)
  const nonBillableHours = totalHours - billableHours
  const totalEarnings = totalHours * (user?.hourlyRate || 0)

  const handleSubmitTimesheet = () => {
    const newTimesheet = {
      id: `ts-${Date.now()}`,
      taskId: selectedTask,
      projectId: myTasks.find(t => t.id === selectedTask)?.projectId,
      userId: user?.id,
      hours: parseFloat(hours),
      date: selectedDate.toISOString(),
      billable: billable === "true",
      notes,
      createdAt: new Date().toISOString()
    }

    console.log("Submitting timesheet:", newTimesheet)
    
    // Reset form
    setSelectedTask("")
    setHours("")
    setBillable("true")
    setNotes("")
    setSelectedDate(new Date())
    setShowTimesheetDialog(false)
  }

  const handleEditTimesheet = (timesheet: any) => {
    setEditingTimesheet(timesheet)
    setSelectedTask(timesheet.taskId)
    setHours(timesheet.hours.toString())
    setBillable(timesheet.billable.toString())
    setNotes(timesheet.notes)
    setSelectedDate(new Date(timesheet.date))
    setShowTimesheetDialog(true)
  }

  const TimesheetCard = ({ timesheet }: { timesheet: any }) => {
    const task = myTasks.find(t => t.id === timesheet.taskId)
    const project = myProjects.find(p => p.id === timesheet.projectId)
    
    return (
      <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
              {task?.title || "Unknown Task"}
            </h3>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
              {project?.name} • {format(new Date(timesheet.date), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{timesheet.hours}h</p>
            <Badge className={timesheet.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {timesheet.billable ? "Billable" : "Non-billable"}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm mb-3" style={{ color: "var(--odoo-text)" }}>{timesheet.notes}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: "var(--odoo-muted)" }}>
            Earnings: ₹{(timesheet.hours * (user?.hourlyRate || 0)).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEditTimesheet(timesheet)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              My Timesheets
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Track your work hours and manage time entries</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Total Hours</span>
              </div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {filterPeriod.replace('_', ' ')}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Billable Hours</span>
              </div>
              <p className="text-2xl font-bold">{billableHours}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {nonBillableHours} non-billable
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Earnings</span>
              </div>
              <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                @ ₹{user?.hourlyRate}/hour
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Avg/Day</span>
              </div>
              <p className="text-2xl font-bold">
                {filteredTimesheets.length > 0 ? (totalHours / filteredTimesheets.length).toFixed(1) : 0}h
              </p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {filteredTimesheets.length} entries
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => {
              setEditingTimesheet(null)
              setShowTimesheetDialog(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Log Hours
            </Button>
          </div>

          {/* Timesheets List */}
          <div className="space-y-4">
            {filteredTimesheets.length > 0 ? (
              filteredTimesheets
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((timesheet: any) => (
                  <TimesheetCard key={timesheet.id} timesheet={timesheet} />
                ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                <p style={{ color: "var(--odoo-muted)" }}>No timesheets found for the selected period</p>
                <Button className="mt-4" onClick={() => setShowTimesheetDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Hours
                </Button>
              </div>
            )}
          </div>

          {/* Timesheet Dialog */}
          <Dialog open={showTimesheetDialog} onOpenChange={setShowTimesheetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTimesheet ? "Edit Timesheet" : "Log Hours"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task *</Label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTasks.map((task: any) => {
                        const project = myProjects.find(p => p.id === task.projectId)
                        return (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title} ({project?.name})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Hours *</Label>
                    <Input 
                      type="number" 
                      step="0.5"
                      min="0.5"
                      max="24"
                      placeholder="8"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Billing Type *</Label>
                  <Select value={billable} onValueChange={setBillable}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Billable (Client pays)</SelectItem>
                      <SelectItem value="false">Non-billable (Company absorbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Work Description *</Label>
                  <Textarea 
                    placeholder="What did you work on? Be specific..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {selectedTask && hours && (
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Hours:</span>
                        <span className="font-medium">{hours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-medium">₹{user?.hourlyRate}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-bold">₹{(parseFloat(hours || "0") * (user?.hourlyRate || 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billing:</span>
                        <Badge className={billable === "true" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {billable === "true" ? "Billable" : "Non-billable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowTimesheetDialog(false)
                    setEditingTimesheet(null)
                    setSelectedTask("")
                    setHours("")
                    setBillable("true")
                    setNotes("")
                    setSelectedDate(new Date())
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitTimesheet}
                    disabled={!selectedTask || !hours || !notes}
                  >
                    {editingTimesheet ? "Update" : "Log Hours"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
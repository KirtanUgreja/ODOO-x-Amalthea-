"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

export default function EmployeeSchedulePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) return <div>Loading...</div>

  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const myTimesheets = db.timesheets.filter((ts: any) => ts.userId === user?.id)

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getTasksForDate = (date: Date) => {
    return myTasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      return dueDate.toDateString() === date.toDateString()
    })
  }

  const getHoursForDate = (date: Date) => {
    return myTimesheets
      .filter(ts => new Date(ts.date).toDateString() === date.toDateString())
      .reduce((sum, ts) => sum + ts.hours, 0)
  }

  const weekDates = getWeekDates(currentDate)
  const today = new Date()

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Work Schedule</h1>
            <p style={{ color: "var(--odoo-muted)" }}>Your weekly schedule with tasks and logged hours</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: "var(--odoo-text)" }}>
              Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() - 7)
                setCurrentDate(newDate)
              }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() + 7)
                setCurrentDate(newDate)
              }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const tasksForDay = getTasksForDate(date)
              const hoursForDay = getHoursForDate(date)
              const isToday = date.toDateString() === today.toDateString()
              const isPast = date < today
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${isToday ? 'ring-2 ring-blue-500' : ''}`} 
                     style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium" style={{ color: "var(--odoo-muted)" }}>
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`} 
                         style={{ color: isToday ? undefined : "var(--odoo-text)" }}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {hoursForDay > 0 && (
                      <div className="flex items-center gap-1 text-xs p-2 rounded" 
                           style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                        <Clock className="w-3 h-3 text-green-500" />
                        <span>{hoursForDay}h logged</span>
                      </div>
                    )}

                    {tasksForDay.map(task => (
                      <div key={task.id} className="text-xs p-2 rounded border-l-2" 
                           style={{ 
                             backgroundColor: "var(--odoo-light-bg)",
                             borderLeftColor: task.status === "done" ? "#10b981" : 
                                            task.priority === "high" ? "#ef4444" : "#6b7280"
                           }}>
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className={`text-xs ${
                            task.status === "done" ? "bg-green-100 text-green-800" :
                            task.status === "blocked" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {task.status}
                          </Badge>
                          {isPast && task.status !== "done" && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}

                    {tasksForDay.length === 0 && hoursForDay === 0 && (
                      <div className="text-xs text-center py-4" style={{ color: "var(--odoo-muted)" }}>
                        No tasks or hours
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">This Week</span>
              </div>
              <p className="text-2xl font-bold">
                {weekDates.reduce((sum, date) => sum + getHoursForDate(date), 0)}h
              </p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Hours logged</p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Due This Week</span>
              </div>
              <p className="text-2xl font-bold">
                {weekDates.reduce((sum, date) => sum + getTasksForDate(date).length, 0)}
              </p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Tasks due</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Avg/Day</span>
              </div>
              <p className="text-2xl font-bold">
                {(weekDates.reduce((sum, date) => sum + getHoursForDate(date), 0) / 7).toFixed(1)}h
              </p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Daily average</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
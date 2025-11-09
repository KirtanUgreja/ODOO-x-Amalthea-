"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Clock, AlertCircle, MessageSquare, DollarSign, X } from "lucide-react"

export default function EmployeeNotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
    
    if (user && db) {
      // Generate notifications based on user data
      const myTasks = db.tasks.filter((t: any) => t.assignedTo === user.id)
      const myExpenses = db.expenses.filter((e: any) => e.userId === user.id)
      const taskComments = db.taskComments.filter((c: any) => 
        myTasks.some(t => t.id === c.taskId) && c.userId !== user.id
      )

      const generatedNotifications = [
        ...myTasks.filter(t => new Date(t.dueDate) <= new Date(Date.now() + 24*60*60*1000) && t.status !== "done")
          .map(task => ({
            id: `task-${task.id}`,
            type: "deadline",
            title: "Task Due Soon",
            message: `"${task.title}" is due ${new Date(task.dueDate).toLocaleDateString()}`,
            time: new Date(task.dueDate),
            read: false,
            priority: task.priority === "high" ? "high" : "medium"
          })),
        ...myExpenses.filter(e => e.status === "approved")
          .map(expense => ({
            id: `expense-${expense.id}`,
            type: "expense",
            title: "Expense Approved",
            message: `Your expense of ₹${expense.amount} has been approved`,
            time: new Date(expense.createdAt),
            read: false,
            priority: "medium"
          })),
        ...taskComments.map(comment => ({
          id: `comment-${comment.id}`,
          type: "comment",
          title: "New Task Comment",
          message: `New comment on your task: "${comment.comment.substring(0, 50)}..."`,
          time: new Date(comment.createdAt),
          read: false,
          priority: "low"
        }))
      ].sort((a, b) => b.time.getTime() - a.time.getTime())

      setNotifications(generatedNotifications)
    }
  }, [user, loading, router, db])

  if (loading || !db) return <div>Loading...</div>

  const unreadCount = notifications.filter(n => !n.read).length
  const todayNotifications = notifications.filter(n => 
    n.time.toDateString() === new Date().toDateString()
  )
  const olderNotifications = notifications.filter(n => 
    n.time.toDateString() !== new Date().toDateString()
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline": return <Clock className="w-4 h-4 text-orange-500" />
      case "expense": return <DollarSign className="w-4 h-4 text-green-500" />
      case "comment": return <MessageSquare className="w-4 h-4 text-blue-500" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})))
  }

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div className={`p-4 rounded-lg border ${!notification.read ? 'bg-blue-50' : ''}`} 
         style={{ backgroundColor: notification.read ? "var(--odoo-card)" : undefined }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              {notification.priority === "high" && (
                <Badge className="bg-red-100 text-red-800 text-xs">High</Badge>
              )}
            </div>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{notification.message}</p>
            <p className="text-xs mt-1" style={{ color: "var(--odoo-muted)" }}>
              {notification.time.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {!notification.read && (
            <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => 
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
          }>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-3 bg-red-500 text-white">{unreadCount} new</Badge>
                  )}
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>Stay updated with your tasks and activities</p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {todayNotifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: "var(--odoo-text)" }}>Today</h3>
                  <div className="space-y-3">
                    {todayNotifications.map(notification => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
              
              {olderNotifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: "var(--odoo-text)" }}>Earlier</h3>
                  <div className="space-y-3">
                    {olderNotifications.map(notification => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                  <p style={{ color: "var(--odoo-muted)" }}>No notifications yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-3">
              {notifications.filter(n => !n.read).map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </TabsContent>

            <TabsContent value="deadlines" className="space-y-3">
              {notifications.filter(n => n.type === "deadline").map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-3">
              {notifications.filter(n => n.type === "expense").map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
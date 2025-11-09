"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Clock, 
  Target,
  Edit,
  Save,
  X
} from "lucide-react"

export default function EmployeeProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      })
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const myTimesheets = db.timesheets.filter((ts: any) => ts.userId === user?.id)
  const myExpenses = db.expenses.filter((e: any) => e.userId === user?.id)
  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))

  const totalHours = myTimesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0)
  const completedTasks = myTasks.filter(t => t.status === "done").length
  const totalEarnings = totalHours * (user?.hourlyRate || 0)

  const handleSave = () => {
    console.log("Saving profile:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || ""
    })
    setIsEditing(false)
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              My Profile
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Manage your personal information and view work statistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{user?.name}</CardTitle>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Team Member</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" style={{ color: "var(--odoo-muted)" }} />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4" style={{ color: "var(--odoo-muted)" }} />
                    <span className="text-sm">₹{user?.hourlyRate}/hour</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" style={{ color: "var(--odoo-muted)" }} />
                    <span className="text-sm">Joined {new Date(user?.createdAt || "").toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Active Projects</span>
                    </div>
                    <span className="font-semibold">{myProjects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Completed Tasks</span>
                    </div>
                    <span className="font-semibold">{completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Total Hours</span>
                    </div>
                    <span className="font-semibold">{totalHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Total Earnings</span>
                    </div>
                    <span className="font-semibold">₹{totalEarnings.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="work">Work History</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          {isEditing ? (
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                              {formData.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Email Address</Label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                              {formData.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          {isEditing ? (
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              placeholder="+91 98765 43210"
                            />
                          ) : (
                            <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                              {formData.phone || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Hourly Rate</Label>
                          <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                            ₹{user?.hourlyRate}/hour (Set by Admin)
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Your address"
                          />
                        ) : (
                          <p className="text-sm mt-1 p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                            {formData.address || "Not provided"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="work">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Projects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {myProjects.map((project: any) => (
                            <div key={project.id} className="p-3 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                              <h4 className="font-semibold">{project.name}</h4>
                              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                                {project.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--odoo-muted)" }}>
                                <span>Status: {project.status}</span>
                                <span>Budget: ₹{project.budget?.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {myTimesheets.slice(0, 5).map((timesheet: any) => {
                            const task = myTasks.find(t => t.id === timesheet.taskId)
                            return (
                              <div key={timesheet.id} className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                                <Clock className="w-4 h-4 text-blue-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{task?.title}</p>
                                  <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                                    {timesheet.hours}h logged on {new Date(timesheet.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold">
                                  ₹{(timesheet.hours * (user?.hourlyRate || 0)).toLocaleString()}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Change Password</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <Input type="password" placeholder="Current password" />
                          <Input type="password" placeholder="New password" />
                        </div>
                        <Button className="mt-2" variant="outline">
                          Update Password
                        </Button>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Notification Preferences</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Email notifications for task assignments</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Email notifications for deadline reminders</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Email notifications for expense approvals</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User,
  Mail,
  Building,
  DollarSign,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Clock
} from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface UserProfileProps {
  user: UserType
  onUpdateUser?: (user: Partial<UserType>) => void
}

export function UserProfile({ user, onUpdateUser }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    hourlyRate: user.hourlyRate || 0
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800"
      case "project_manager": return "bg-blue-100 text-blue-800"
      case "team_member": return "bg-green-100 text-green-800"
      case "sales_finance": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin": return "Administrator"
      case "project_manager": return "Project Manager"
      case "team_member": return "Team Member"
      case "sales_finance": return "Sales & Finance"
      default: return role
    }
  }

  const handleSave = () => {
    onUpdateUser?.(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      hourlyRate: user.hourlyRate || 0
    })
    setIsEditing(false)
  }

  // Mock user activity data
  const activityStats = {
    projectsWorkedOn: 3,
    totalHoursLogged: 156,
    expensesSubmitted: 12,
    tasksCompleted: 28,
    lastLogin: "2024-01-20T10:30:00Z"
  }

  const recentActivity = [
    {
      id: "1",
      type: "task",
      description: "Completed task: Design Landing Page",
      timestamp: "2024-01-20T14:30:00Z"
    },
    {
      id: "2",
      type: "timesheet",
      description: "Logged 8 hours on Website Redesign project",
      timestamp: "2024-01-20T08:00:00Z"
    },
    {
      id: "3",
      type: "expense",
      description: "Submitted expense: Client lunch meeting",
      timestamp: "2024-01-19T15:45:00Z"
    },
    {
      id: "4",
      type: "task",
      description: "Started task: Implement User Authentication",
      timestamp: "2024-01-19T09:15:00Z"
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task": return <Shield className="h-4 w-4" />
      case "timesheet": return <Clock className="h-4 w-4" />
      case "expense": return <DollarSign className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Enhanced with better spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and view your activity
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                    {isEditing ? (
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={editForm.hourlyRate}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${user.hourlyRate || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{user.id}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Company ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{user.companyId}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Account Created</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityStats.projectsWorkedOn}</div>
                <p className="text-xs text-muted-foreground">Active projects</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityStats.totalHoursLogged}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityStats.tasksCompleted}</div>
                <p className="text-xs text-muted-foreground">Completed tasks</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityStats.expensesSubmitted}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Last login and account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Login</span>
                  <span className="text-sm font-medium">
                    {new Date(activityStats.lastLogin).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleName(user.role)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

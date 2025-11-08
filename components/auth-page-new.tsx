"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Receipt, TrendingUp, Shield, Zap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthPageNew() {
  const { login, register, isLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Registration form state
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupRole, setSignupRole] = useState<'admin' | 'project_manager' | 'team_member' | 'finance'>('team_member')
  const [signupHourlyRate, setSignupHourlyRate] = useState("75")

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      return
    }

    const result = await login(loginEmail, loginPassword)
    
    if (!result.success) {
      setError(result.error || "Login failed")
    } else {
      setSuccess("Login successful! Redirecting...")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!signupEmail || !signupPassword || !signupName) {
      setError("Please fill in all required fields")
      return
    }

    const result = await register({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      hourly_rate: parseFloat(signupHourlyRate) || 0,
    })

    if (!result.success) {
      setError(result.error || "Registration failed")
    } else {
      setSuccess("Account created successfully! Redirecting...")
    }
  }

  const fillDemoCredentials = (email: string, password: string) => {
    setLoginEmail(email)
    setLoginPassword(password)
    clearMessages()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - OneFlow Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/20 rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              OneFlow
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Plan to Bill in{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                One Place
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Streamline your entire business workflow from project planning to final billing with our integrated ERP solution.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Project Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Track projects, tasks, and team productivity in real-time
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Financial Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated billing, expense tracking, and financial reporting
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enterprise Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 bg-background/60 backdrop-blur-sm rounded-xl border border-primary/20">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm">
              <span className="font-medium">Trusted by 10,000+ teams</span>
              <span className="text-muted-foreground"> • Built for modern workflows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-background/50">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Receipt className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">OneFlow</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to OneFlow</h2>
              <p className="text-muted-foreground">Plan to Bill in One Place</p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50">
              <TabsTrigger value="login" className="h-10 font-medium">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="h-10 font-medium">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  
                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="text-sm font-medium mb-3">Demo Login Accounts:</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>👤 Employee</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs h-6 px-2"
                          onClick={() => fillDemoCredentials("dev1@oneflow.com", "employee123")}
                        >
                          dev1@oneflow.com
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>👨‍💼 Project Manager</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs h-6 px-2"
                          onClick={() => fillDemoCredentials("pm@oneflow.com", "manager123")}
                        >
                          pm@oneflow.com
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>⚙️ Admin</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs h-6 px-2"
                          onClick={() => fillDemoCredentials("admin@oneflow.com", "admin123")}
                        >
                          admin@oneflow.com
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>💰 Finance</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs h-6 px-2"
                          onClick={() => fillDemoCredentials("finance@oneflow.com", "finance123")}
                        >
                          finance@oneflow.com
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <p><strong>Demo Credentials:</strong> Click any email to auto-fill login credentials.</p>
                      <p><strong>Passwords:</strong> admin123, manager123, employee123, finance123</p>
                      <p>Each user will be redirected to their role-specific dashboard after login.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create your account</CardTitle>
                  <CardDescription>Join OneFlow and start managing your projects efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@company.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Min 8 characters, include uppercase, lowercase, number & symbol"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Role</Label>
                      <Select value={signupRole} onValueChange={(value: any) => setSignupRole(value)}>
                        <SelectTrigger id="signup-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="team_member">Team Member</SelectItem>
                          <SelectItem value="project_manager">Project Manager</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-hourly-rate">Hourly Rate (USD)</Label>
                      <Input
                        id="signup-hourly-rate"
                        type="number"
                        placeholder="75"
                        value={signupHourlyRate}
                        onChange={(e) => setSignupHourlyRate(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                    <strong>Password Requirements:</strong> Minimum 8 characters with uppercase, lowercase, number, and special character.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

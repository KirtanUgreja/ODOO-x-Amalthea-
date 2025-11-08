"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Currency } from "@/lib/types"
import { Receipt, TrendingUp, Shield, Zap } from "lucide-react"

export function AuthPage() {
  const { login, signup } = useData()
  const [isLoading, setIsLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupCompanyName, setSignupCompanyName] = useState("")
  const [signupCurrency, setSignupCurrency] = useState<Currency>("USD")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const success = await login(loginEmail, loginPassword)
    setIsLoading(false)
    if (!success) {
      alert("Invalid credentials")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await signup(signupEmail, signupPassword, signupName, signupCompanyName, signupCurrency)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - OneFlow Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">OneFlow</span>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-balance leading-tight">
                Plan to Bill in
                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-2">
                  One Place
                </span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Complete project management solution for modern teams. From initial planning to final billing - streamline your entire workflow.
              </p>
            </div>

            <div className="grid gap-6 pt-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Project Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize and track projects from conception to completion
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Financial Management</h3>
                  <p className="text-sm text-muted-foreground">Handle invoicing, expenses, and financial reporting</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless collaboration across all departments
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

          <Tabs defaultValue="login" className="w-full">
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
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                  
                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="text-sm font-medium mb-3">Demo Login Accounts:</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>👨‍� Employee</span>
                        <span className="font-mono">employee@oneflow.com / 12345</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>👨‍� Project Manager</span>
                        <span className="font-mono">manager@oneflow.com / 12345</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>�️ Admin</span>
                        <span className="font-mono">admin@oneflow.com / 12345</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>� Finance</span>
                        <span className="font-mono">finance@oneflow.com / 12345</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
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
                  <CardDescription>Get started with OneFlow in seconds</CardDescription>
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
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-company">Company Name</Label>
                      <Input
                        id="signup-company"
                        placeholder="Acme Inc."
                        value={signupCompanyName}
                        onChange={(e) => setSignupCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-currency">Company Currency</Label>
                      <Select value={signupCurrency} onValueChange={(value) => setSignupCurrency(value as Currency)}>
                        <SelectTrigger id="signup-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

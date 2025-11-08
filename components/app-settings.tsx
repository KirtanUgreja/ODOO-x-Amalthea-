"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Settings,
  Building,
  DollarSign,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  Save,
  AlertTriangle
} from "lucide-react"

interface AppSettingsProps {
  onSaveSettings?: (settings: any) => void
}

export function AppSettings({ onSaveSettings }: AppSettingsProps) {
  const [settings, setSettings] = useState({
    company: {
      name: "Acme Corporation",
      currency: "USD",
      timeZone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      fiscalYearStart: "January"
    },
    notifications: {
      emailEnabled: true,
      taskUpdates: true,
      expenseApprovals: true,
      projectMilestones: true,
      overdueReminders: true,
      dailyDigest: false
    },
    workflow: {
      autoApproveExpenses: false,
      expenseApprovalLimit: 500,
      requireReceiptsOver: 25,
      timesheetApprovalRequired: true,
      projectBudgetAlerts: true,
      budgetAlertThreshold: 80
    },
    security: {
      passwordExpiry: 90,
      sessionTimeout: 480,
      twoFactorRequired: false,
      ipRestrictions: false,
      auditLogging: true
    }
  })

  const handleSave = () => {
    onSaveSettings?.(settings)
    // Show success message
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" }
  ]

  const timeZones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney"
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure application settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic company settings and localization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.company.name}
                      onChange={(e) => updateSetting('company', 'name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={settings.company.currency} 
                      onValueChange={(value) => updateSetting('company', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select 
                      value={settings.company.timeZone} 
                      onValueChange={(value) => updateSetting('company', 'timeZone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeZones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settings.company.dateFormat} 
                      onValueChange={(value) => updateSetting('company', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                    <Select 
                      value={settings.company.fiscalYearStart} 
                      onValueChange={(value) => updateSetting('company', 'fiscalYearStart', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fiscal year start" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Updates</Label>
                      <p className="text-xs text-muted-foreground">Task assignments and status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.taskUpdates}
                      onCheckedChange={(checked) => updateSetting('notifications', 'taskUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Expense Approvals</Label>
                      <p className="text-xs text-muted-foreground">Expense submission and approval notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.expenseApprovals}
                      onCheckedChange={(checked) => updateSetting('notifications', 'expenseApprovals', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Project Milestones</Label>
                      <p className="text-xs text-muted-foreground">Project completion and milestone updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications.projectMilestones}
                      onCheckedChange={(checked) => updateSetting('notifications', 'projectMilestones', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Overdue Reminders</Label>
                      <p className="text-xs text-muted-foreground">Reminders for overdue tasks and invoices</p>
                    </div>
                    <Switch
                      checked={settings.notifications.overdueReminders}
                      onCheckedChange={(checked) => updateSetting('notifications', 'overdueReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Digest</Label>
                      <p className="text-xs text-muted-foreground">Daily summary of activities and updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications.dailyDigest}
                      onCheckedChange={(checked) => updateSetting('notifications', 'dailyDigest', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Settings */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workflow Configuration
              </CardTitle>
              <CardDescription>
                Automation rules and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve Small Expenses</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically approve expenses below the threshold
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflow.autoApproveExpenses}
                    onCheckedChange={(checked) => updateSetting('workflow', 'autoApproveExpenses', checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="approvalLimit">Expense Approval Limit ($)</Label>
                    <Input
                      id="approvalLimit"
                      type="number"
                      value={settings.workflow.expenseApprovalLimit}
                      onChange={(e) => updateSetting('workflow', 'expenseApprovalLimit', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiptThreshold">Require Receipts Over ($)</Label>
                    <Input
                      id="receiptThreshold"
                      type="number"
                      value={settings.workflow.requireReceiptsOver}
                      onChange={(e) => updateSetting('workflow', 'requireReceiptsOver', Number(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timesheet Approval Required</Label>
                    <p className="text-xs text-muted-foreground">Require manager approval for timesheets</p>
                  </div>
                  <Switch
                    checked={settings.workflow.timesheetApprovalRequired}
                    onCheckedChange={(checked) => updateSetting('workflow', 'timesheetApprovalRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Project Budget Alerts</Label>
                    <p className="text-xs text-muted-foreground">Send alerts when budget thresholds are reached</p>
                  </div>
                  <Switch
                    checked={settings.workflow.projectBudgetAlerts}
                    onCheckedChange={(checked) => updateSetting('workflow', 'projectBudgetAlerts', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="budgetThreshold">Budget Alert Threshold (%)</Label>
                  <Input
                    id="budgetThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.workflow.budgetAlertThreshold}
                    onChange={(e) => updateSetting('workflow', 'budgetAlertThreshold', Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access Control
              </CardTitle>
              <CardDescription>
                Security policies and access management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting('security', 'passwordExpiry', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorRequired}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Restrictions</Label>
                    <p className="text-xs text-muted-foreground">Restrict access by IP address ranges</p>
                  </div>
                  <Switch
                    checked={settings.security.ipRestrictions}
                    onCheckedChange={(checked) => updateSetting('security', 'ipRestrictions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Log all user actions for compliance</p>
                  </div>
                  <Switch
                    checked={settings.security.auditLogging}
                    onCheckedChange={(checked) => updateSetting('security', 'auditLogging', checked)}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Security Notice</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Changes to security settings will take effect after all users log out and back in.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

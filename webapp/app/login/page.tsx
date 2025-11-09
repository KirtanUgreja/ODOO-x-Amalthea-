"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(email, password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password")
    }
    setLoading(false)
  }



  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--odoo-light-bg)" }}
    >
      <div className="w-full max-w-md">
        <div className="p-8 rounded-lg shadow-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: "var(--odoo-primary)" }}
            >
              OF
            </div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              OneFlow
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Project Management System</p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 rounded flex items-center gap-2"
              style={{
                backgroundColor: "#FFE5E5",
                borderColor: "var(--odoo-danger)",
              }}
            >
              <AlertCircle size={18} style={{ color: "var(--odoo-danger)" }} />
              <span style={{ color: "var(--odoo-danger)" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded border focus:outline-none"
                style={{
                  borderColor: "var(--odoo-border)",
                  backgroundColor: "var(--odoo-light-bg)",
                  color: "var(--odoo-text)",
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded border focus:outline-none"
                style={{
                  borderColor: "var(--odoo-border)",
                  backgroundColor: "var(--odoo-light-bg)",
                  color: "var(--odoo-text)",
                }}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-2"
              style={{ backgroundColor: "var(--odoo-primary)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>


        </div>
      </div>
    </div>
  )
}

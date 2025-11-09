import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

function getDatabase() {
  const dbPath = path.join(process.cwd(), "lib", "db.json")
  const dbContent = fs.readFileSync(dbPath, "utf8")
  return JSON.parse(dbContent)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("[v0] Login attempt:", { email })

    const db = getDatabase()
    const user = db.users.find((u: any) => u.email === email && u.password === password)
    console.log("[v0] User found:", user ? user.email : "no match")

    if (!user) {
      console.log("[v0] Invalid credentials for:", email)
      return NextResponse.json({ error: "Invalid credentials", success: false })
    }

    const { password: _, ...userWithoutPassword } = user
    console.log("[v0] Login successful:", userWithoutPassword.email)
    return NextResponse.json({ ...userWithoutPassword, success: true })
  } catch (error) {
    console.log("[v0] Login error:", error)
    return NextResponse.json({ error: "Authentication failed", success: false })
  }
}

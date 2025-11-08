"use client"

import { useEffect, useState } from "react"

export function ClientOnly({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading application...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

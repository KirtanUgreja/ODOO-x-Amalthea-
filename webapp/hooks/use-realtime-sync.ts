"use client"

import { useEffect, useRef } from "react"

interface SyncOptions {
  interval?: number
  onSync?: () => void
  onError?: (error: Error) => void
}

export function useRealtimeSync(
  syncFunction: () => Promise<void>,
  options: SyncOptions = {}
) {
  const { interval = 30000, onSync, onError } = options
  const intervalRef = useRef<NodeJS.Timeout>()
  const isActiveRef = useRef(true)

  useEffect(() => {
    const sync = async () => {
      if (!isActiveRef.current) return
      
      try {
        await syncFunction()
        onSync?.()
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Sync failed'))
      }
    }

    // Initial sync
    sync()

    // Set up interval
    intervalRef.current = setInterval(sync, interval)

    // Sync on window focus
    const handleFocus = () => {
      if (isActiveRef.current) {
        sync()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      isActiveRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      window.removeEventListener('focus', handleFocus)
    }
  }, [syncFunction, interval, onSync, onError])

  const forceSync = async () => {
    try {
      await syncFunction()
      onSync?.()
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Manual sync failed'))
    }
  }

  return { forceSync }
}
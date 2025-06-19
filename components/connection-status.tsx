"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export function ConnectionStatus() {
  const [connectionMode] = useState<"demo">("demo")

  useEffect(() => {
    // Force demo mode - no connection testing
    console.log("🎭 Connection Status: Demo mode active (no database connection attempts)")
  }, [])

  return (
    <Badge variant="secondary" className="bg-green-500 text-white">
      <CheckCircle className="h-3 w-3 mr-1" />
      Demo Mode
    </Badge>
  )
}

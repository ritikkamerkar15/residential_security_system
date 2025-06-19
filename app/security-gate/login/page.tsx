"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, CheckCircle, Info, Camera, Users, BarChart3 } from "lucide-react"
import { database } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { ConnectionStatus } from "@/components/connection-status"

export default function SecurityGateLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    employeeId: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("🔐 Attempting login for:", credentials.employeeId)

      const guard = await database.authenticateGuard(credentials.employeeId, credentials.password)

      if (guard) {
        // Store guard info in localStorage for session management
        localStorage.setItem("currentGuard", JSON.stringify(guard))

        toast({
          title: "Login Successful",
          description: `Welcome ${guard.name}! Security portal is ready.`,
        })
        router.push("/security-gate")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid employee ID or password. Try the demo credentials below.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="shadow-lg bg-white border-gray-200">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Security Gate Portal</CardTitle>
            <p className="text-gray-600 mt-2">Access the security management system</p>

            {/* Connection status */}
            <div className="flex justify-center items-center gap-2 mt-3">
              <ConnectionStatus />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="employeeId" className="text-gray-700">
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  type="text"
                  value={credentials.employeeId}
                  onChange={(e) => setCredentials({ ...credentials, employeeId: e.target.value })}
                  placeholder="Enter your employee ID"
                  className="mt-1 bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  className="mt-1 bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6" disabled={loading}>
                {loading ? "Logging in..." : "Access Security Portal"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">🔑 Demo Credentials:</p>
              <div className="space-y-1">
                <p className="text-sm text-blue-700">
                  Employee ID: <strong>SEC001</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Password: <strong>guard123</strong>
                </p>
              </div>
            </div>

            {/* System Features */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Full System Access</p>
                  <p className="text-xs text-green-700 mt-1">Complete security management features:</p>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Camera className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-700">Visitor registration with photo capture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-700">Guard attendance management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-700">Real-time request tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Portals Info */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Other System Portals</p>
                  <div className="text-xs text-purple-700 mt-1 space-y-1">
                    <p>
                      • <strong>Resident Portal:</strong> A-101 / resident123
                    </p>
                    <p>
                      • <strong>Admin Dashboard:</strong> admin001 / admin123
                    </p>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Access from the main homepage</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, ArrowLeft } from "lucide-react"
import { database } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    adminId: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const admin = await database.authenticateAdmin(credentials.adminId, credentials.password)

      if (admin) {
        // Store admin info in localStorage for session management
        localStorage.setItem("currentAdmin", JSON.stringify(admin))

        toast({
          title: "Login Successful",
          description: `Welcome ${admin.name}!`,
        })
        router.push("/admin")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin ID or password",
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
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminId" className="text-gray-700">
                  Admin ID
                </Label>
                <Input
                  id="adminId"
                  type="text"
                  value={credentials.adminId}
                  onChange={(e) => setCredentials({ ...credentials, adminId: e.target.value })}
                  placeholder="Enter your admin ID"
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

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 mt-6" disabled={loading}>
                {loading ? "Logging in..." : "Login to Admin Dashboard"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-800 mb-2">Demo Credentials:</p>
              <p className="text-sm text-purple-700">Admin ID: admin001</p>
              <p className="text-sm text-purple-700">Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

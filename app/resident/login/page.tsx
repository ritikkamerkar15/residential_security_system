"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, ArrowLeft } from "lucide-react"
import { database } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function ResidentLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    flatNumber: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resident = await database.authenticateResident(credentials.flatNumber, credentials.password)

      if (resident) {
        // Store resident info in localStorage for session management
        localStorage.setItem("currentResident", JSON.stringify(resident))

        toast({
          title: "Login Successful",
          description: `Welcome ${resident.name}!`,
        })
        router.push("/resident")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid flat number or password",
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
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Home className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Resident Login</CardTitle>
            <p className="text-gray-600 mt-2">Enter your credentials to access your resident portal</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="flatNumber" className="text-gray-700">
                  Flat Number
                </Label>
                <Input
                  id="flatNumber"
                  type="text"
                  value={credentials.flatNumber}
                  onChange={(e) => setCredentials({ ...credentials, flatNumber: e.target.value })}
                  placeholder="Enter your flat number (e.g., A-101)"
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

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-6" disabled={loading}>
                {loading ? "Logging in..." : "Login to Resident Portal"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">Demo Credentials:</p>
              <p className="text-sm text-green-700">Flat Number: A-101</p>
              <p className="text-sm text-green-700">Password: resident123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

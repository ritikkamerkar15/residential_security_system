"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/lib/auth"
import { Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminAuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = AuthService.getInstance()

  const [loginData, setLoginData] = useState({ username: "", password: "" })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = authService.login(loginData)
    if (user && user.role === "admin") {
      toast({
        title: "Login Successful",
        description: `Welcome, ${user.name}!`,
      })
      router.push("/admin")
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SafeHaven</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Administrator Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Access the administrative control panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminId">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your admin ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>

            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">Demo Credentials:</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Admin ID: admin001</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Password: adminpass</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { AuthService } from "@/lib/auth"
import { UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SecurityAuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = AuthService.getInstance()

  // Login state
  const [loginData, setLoginData] = useState({ username: "", password: "" })

  // Registration state
  const [registerData, setRegisterData] = useState({
    employeeId: "",
    password: "",
    name: "",
    phone: "",
  })

  const [documents, setDocuments] = useState({
    jobOfferLetter: null as File | null,
    profilePhoto: null as File | null,
    identityProof: null as File | null,
    securityIdCard: null as File | null,
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = authService.login(loginData)
    if (user && user.role === "security") {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      })
      router.push("/security")
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or unauthorized access.",
        variant: "destructive",
      })
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone number
    if (!/^\d{10}$/.test(registerData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      })
      return
    }

    const user = authService.register({
      username: registerData.employeeId,
      employeeId: registerData.employeeId,
      password: registerData.password,
      name: registerData.name,
      phone: registerData.phone,
      role: "security",
      documents: {
        jobOfferLetter: documents.jobOfferLetter?.name,
        profilePhoto: documents.profilePhoto?.name,
        identityProof: documents.identityProof?.name,
        securityIdCard: documents.securityIdCard?.name,
      },
    })

    toast({
      title: "Registration Successful",
      description: "Your account has been created and is pending approval.",
    })

    // Auto-login after registration
    const loginUser = authService.login({ username: registerData.employeeId, password: registerData.password })
    if (loginUser) {
      router.push("/security")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <UserCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SafeHaven</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Security Guard Portal</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Security Guard Login</CardTitle>
                <CardDescription>Enter your employee credentials to access the security portal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      placeholder="Enter your employee ID"
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

                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">Demo Credentials:</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Employee ID: SEC789</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Password: guardpass</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Security Guard Registration</CardTitle>
                <CardDescription>Register as a security guard to access the monitoring system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-employeeId">Employee ID *</Label>
                      <Input
                        id="reg-employeeId"
                        type="text"
                        value={registerData.employeeId}
                        onChange={(e) => setRegisterData({ ...registerData, employeeId: e.target.value })}
                        placeholder="e.g., SEC789"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password *</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-name">Full Name *</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-phone">Phone Number *</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        placeholder="10-digit phone number"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Document Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FileUpload
                        label="Job Offer Letter"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onFileSelect={(file) => setDocuments({ ...documents, jobOfferLetter: file })}
                        required
                      />
                      <FileUpload
                        label="Profile Photo"
                        accept=".png,.jpg,.jpeg"
                        onFileSelect={(file) => setDocuments({ ...documents, profilePhoto: file })}
                        required
                      />
                      <FileUpload
                        label="Identity Proof"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onFileSelect={(file) => setDocuments({ ...documents, identityProof: file })}
                        required
                      />
                      <FileUpload
                        label="Security ID Card"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onFileSelect={(file) => setDocuments({ ...documents, securityIdCard: file })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

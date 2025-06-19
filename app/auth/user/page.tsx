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
import { AuthService, type FamilyMember } from "@/lib/auth"
import { Shield, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UserAuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = AuthService.getInstance()

  // Login state
  const [loginData, setLoginData] = useState({ username: "", password: "" })

  // Registration state
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    name: "",
    flat: "",
    phone: "",
  })

  const [documents, setDocuments] = useState({
    propertyPaper: null as File | null,
    profilePhoto: null as File | null,
    identityProof: null as File | null,
  })

  const [familyMembers, setFamilyMembers] = useState<Partial<FamilyMember>[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = authService.login(loginData)
    if (user && user.role === "user") {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      })
      router.push("/user")
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
      ...registerData,
      role: "user",
      documents: {
        propertyPaper: documents.propertyPaper?.name,
        profilePhoto: documents.profilePhoto?.name,
        identityProof: documents.identityProof?.name,
      },
      familyMembers: familyMembers.filter((member) => member.name) as FamilyMember[],
    })

    toast({
      title: "Registration Successful",
      description: "Your account has been created and is pending approval.",
    })

    // Auto-login after registration
    const loginUser = authService.login({ username: registerData.username, password: registerData.password })
    if (loginUser) {
      router.push("/user")
    }
  }

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: "", age: 0 }])
  }

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index))
  }

  const updateFamilyMember = (index: number, field: string, value: any) => {
    const updated = [...familyMembers]
    updated[index] = { ...updated[index], [field]: value }
    setFamilyMembers(updated)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SafeHaven</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Flat Owner Portal</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to Your Account</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      placeholder="Enter your username"
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

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Demo Credentials:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Username: john123</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Password: secure123</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create New Account</CardTitle>
                <CardDescription>Register as a flat owner to access the security system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-username">Username *</Label>
                      <Input
                        id="reg-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
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
                      <Label htmlFor="reg-flat">Flat Number *</Label>
                      <Input
                        id="reg-flat"
                        type="text"
                        value={registerData.flat}
                        onChange={(e) => setRegisterData({ ...registerData, flat: e.target.value })}
                        placeholder="e.g., B-304"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FileUpload
                        label="Property Papers"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onFileSelect={(file) => setDocuments({ ...documents, propertyPaper: file })}
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
                    </div>
                  </div>

                  {/* Family Members */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Family Members</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </div>

                    {familyMembers.map((member, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Family Member {index + 1}</h4>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Name *</Label>
                            <Input
                              value={member.name || ""}
                              onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Phone (Optional)</Label>
                            <Input
                              value={member.phone || ""}
                              onChange={(e) => updateFamilyMember(index, "phone", e.target.value)}
                              pattern="[0-9]{10}"
                            />
                          </div>
                          <div>
                            <Label>Age *</Label>
                            <Input
                              type="number"
                              value={member.age || ""}
                              onChange={(e) => updateFamilyMember(index, "age", Number.parseInt(e.target.value))}
                              min="1"
                              max="120"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
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

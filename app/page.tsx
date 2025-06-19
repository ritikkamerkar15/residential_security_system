"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Home, Settings, ArrowRight } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Residential Security System</h1>
            <p className="text-xl text-gray-600">
              Digitizing Residential Security with Scalable, Real-Time Visitor Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          
          
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Security Gate */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300 bg-white border-gray-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Security Gate</CardTitle>
              <CardDescription className="text-gray-600">Manage visitor entries and verifications</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => router.push("/security-gate/login")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Access Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Resident Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300 bg-white border-gray-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Home className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Resident Portal</CardTitle>
              <CardDescription className="text-gray-600">View and approve visitor requests</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push("/resident/login")} className="w-full bg-green-600 hover:bg-green-700">
                Access Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300 bg-white border-gray-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-fit">
                <Settings className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Admin Dashboard</CardTitle>
              <CardDescription className="text-gray-600">System overview and management</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push("/admin/login")} className="w-full bg-purple-600 hover:bg-purple-700">
                Access Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          
        </div>
      </div>
    </div>
  )
}

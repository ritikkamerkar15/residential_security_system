"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface PortalLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  userName: string
  userInfo?: string
  bgColor: string
}

export function PortalLayout({ children, title, subtitle, userName, userInfo }: PortalLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-900 font-medium">Welcome, {userName}</p>
                {userInfo && <p className="text-sm text-gray-600">{userInfo}</p>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>

      {/* Footer */}
      
    </div>
  )
}

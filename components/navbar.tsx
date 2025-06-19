"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, Menu, X } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "user":
        return "text-blue-600"
      case "security":
        return "text-green-600"
      case "admin":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SafeHaven</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className={`text-sm font-medium ${getRoleColor(currentUser.role)}`}>{currentUser.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{currentUser.role.toUpperCase()}</span>
              </div>
            )}

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {currentUser && (
              <div className="px-3 py-2">
                <div className="text-sm text-gray-600">Welcome,</div>
                <div className={`text-sm font-medium ${getRoleColor(currentUser.role)}`}>{currentUser.name}</div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                  {currentUser.role.toUpperCase()}
                </div>
              </div>
            )}

            {currentUser && (
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

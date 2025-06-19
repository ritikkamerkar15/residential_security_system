"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Users, Shield, Database } from "lucide-react"
import { database } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExport = (dataType: "visitors" | "residents" | "guards" | "all") => {
    setIsExporting(true)

    try {
      const csvContent = database.exportToCSV(dataType)
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `safehaven_${dataType}_${timestamp}.csv`

      downloadCSV(csvContent, filename)

      toast({
        title: "Export Successful",
        description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported successfully`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-sky-500 text-black" asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-600 text-white hover:text-black hover:bg-white transition-colors"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2 hover:text-black transition-colors text-slate-400-500-400-600" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
        <DropdownMenuItem onClick={() => handleExport("visitors")} className="text-slate-300 hover:bg-slate-600">
          <FileText className="h-4 w-4 mr-2" />
          Visitor Requests
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("residents")} className="text-slate-300 hover:bg-slate-600">
          <Users className="h-4 w-4 mr-2" />
          Residents Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("guards")} className="text-slate-300 hover:bg-slate-600">
          <Shield className="h-4 w-4 mr-2" />
          Guards Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("all")} className="text-slate-300 hover:bg-slate-600">
          <Database className="h-4 w-4 mr-2" />
          Complete Database
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

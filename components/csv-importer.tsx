"use client"

import type React from "react"

import { useState } from "react"
import { collection, doc, writeBatch } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload } from "lucide-react"

type EmployeeData = {
  name: string
  role: string
  income: number
}

type ProjectData = {
  clientName: string
  projectName: string
  responsibleEmployees: string[]
  leadership: string
  deliveryDate: string
  completionDate?: string
  status: "active" | "completed"
}

type FinancialData = {
  income: number
  expense: number
  date: string
}

export function CsvImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [importType, setImportType] = useState<"employees" | "projects" | "financial">("employees")
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n")
    return lines
      .map((line) => {
        // Handle quoted values with commas inside
        const result = []
        let inQuote = false
        let currentValue = ""

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"') {
            inQuote = !inQuote
          } else if (char === "," && !inQuote) {
            result.push(currentValue.trim())
            currentValue = ""
          } else {
            currentValue += char
          }
        }

        if (currentValue) {
          result.push(currentValue.trim())
        }

        return result
      })
      .filter((line) => line.length > 1) // Filter out empty lines
  }

  const processEmployeeData = (data: string[][]): EmployeeData[] => {
    const headers = data[0].map((h) => h.toLowerCase())
    const nameIndex = headers.indexOf("name")
    const roleIndex = headers.indexOf("role")
    const incomeIndex = headers.indexOf("income")

    return data.slice(1).map((row) => ({
      name: row[nameIndex] || "",
      role: row[roleIndex] || "",
      income: Number.parseFloat(row[incomeIndex] || "0"),
    }))
  }

  const processProjectData = (data: string[][]): ProjectData[] => {
    const headers = data[0].map((h) => h.toLowerCase())
    const clientNameIndex = headers.indexOf("Nome do cliente")
    const projectNameIndex = headers.indexOf("Nome do projeto")
    const responsibleEmployeesIndex = headers.indexOf("Funcionários Responsaveis")
    const leadershipIndex = headers.indexOf("Lider")
    const deliveryDateIndex = headers.indexOf("Data de entrega")
    const completionDateIndex = headers.indexOf("Data de finalização")
    const statusIndex = headers.indexOf("status")

    return data.slice(1).map((row) => ({
      clientName: row[clientNameIndex] || "",
      projectName: row[projectNameIndex] || "",
      responsibleEmployees: row[responsibleEmployeesIndex]?.split(";") || [],
      leadership: row[leadershipIndex] || "",
      deliveryDate: row[deliveryDateIndex] || "",
      completionDate: row[completionDateIndex] || undefined,
      status: (row[statusIndex]?.toLowerCase() === "completed" ? "completed" : "active") as "active" | "completed",
    }))
  }

  const processFinancialData = (data: string[][]): FinancialData[] => {
    const headers = data[0].map((h) => h.toLowerCase())
    const incomeIndex = headers.indexOf("income")
    const expenseIndex = headers.indexOf("expense")
    const dateIndex = headers.indexOf("date")

    return data.slice(1).map((row) => ({
      income: Number.parseFloat(row[incomeIndex] || "0"),
      expense: Number.parseFloat(row[expenseIndex] || "0"),
      date: row[dateIndex] || new Date().toISOString().split("T")[0],
    }))
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      })
      return
    }

    const user = auth.currentUser
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to import data.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const text = await file.text()
      const parsedData = parseCSV(text)

      if (parsedData.length < 2) {
        throw new Error("CSV file must contain headers and at least one data row")
      }

      const batch = writeBatch(db)
      const companyId = "default" // This should be selected by the user or passed as a prop

      if (importType === "employees") {
        const employees = processEmployeeData(parsedData)

        employees.forEach((employee, index) => {
          const employeeRef = doc(collection(db, "companies", companyId, "employees"))
          batch.set(employeeRef, {
            ...employee,
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
          })
        })
      } else if (importType === "projects") {
        const projects = processProjectData(parsedData)

        projects.forEach((project, index) => {
          const projectRef = doc(collection(db, "companies", companyId, "projects"))
          batch.set(projectRef, {
            ...project,
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
          })
        })
      } else if (importType === "financial") {
        const financials = processFinancialData(parsedData)

        financials.forEach((financial, index) => {
          const financialRef = doc(collection(db, "companies", companyId, "financials"))
          batch.set(financialRef, {
            ...financial,
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
          })
        })
      }

      await batch.commit()

      toast({
        title: "Import Successful",
        description: `Successfully imported ${parsedData.length - 1} ${importType} records.`,
      })

      setFile(null)
      // Reset the file input
      const fileInput = document.getElementById("csv-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "There was an error importing your data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={importType === "employees" ? "default" : "outline"} onClick={() => setImportType("employees")}>
          Employees
        </Button>
        <Button variant={importType === "projects" ? "default" : "outline"} onClick={() => setImportType("projects")}>
          Projects
        </Button>
        <Button variant={importType === "financial" ? "default" : "outline"} onClick={() => setImportType("financial")}>
          Financial Data
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>CSV Format</AlertTitle>
        <AlertDescription>
          {importType === "employees" && "Your CSV should include columns for: Name, Role, Income"}
          {importType === "projects" &&
            "Your CSV should include columns for: Client Name, Project Name, Responsible Employees (separated by ;), Leadership, Delivery Date, Completion Date, Status"}
          {importType === "financial" && "Your CSV should include columns for: Income, Expense, Date"}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="csv-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </div>
            <input id="csv-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {file && (
          <div className="text-sm">
            Selected file: <span className="font-medium">{file.name}</span>
          </div>
        )}

        <Button onClick={handleImport} disabled={!file || loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? "Importing..." : "Import Data"}
        </Button>
      </div>
    </div>
  )
}


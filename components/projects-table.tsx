"use client"

import { useState, useEffect } from "react"
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  CollectionReference, 
  Query 
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Plus, X } from "lucide-react"
import Link from "next/link"

type Project = {
  id: string
  clientName: string
  projectName: string
  leadership: string
  deliveryDate: string
  completionDate?: string
  status: "active" | "completed"
  employeeNames: string[]
  employeeCount: number
  employeeFunction: string
  employeeTable?: string
  income: number
  expenses: number
  responsibleEmployees: string[]
  deadlines: string
}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employeeNames: "",
    employeeCount: 0,
    employeeFunction: "",
    employeeTable: "",
    income: 0,
    expenses: 0,
    clientName: "",
    projectName: "",
    responsibleEmployees: "",
    leadership: "",
    deliveryDate: "",
    completionDate: "",
    status: "active" as "active" | "completed",
    deadlines: "",
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const companiesSnapshot = await getDocs(collection(db, "users", user.uid, "companies"))
        const companies = companiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        let allProjects: Project[] = []

        for (const company of companies) {
          const projectsCollection: CollectionReference<Project> = collection(
            db,
            "companies",
            company.id,
            "projects"
          ) as CollectionReference<Project>

          let projectsQuery: Query<Project> = projectsCollection
          if (statusFilter !== "all") {
            projectsQuery = query(projectsQuery, where("status", "==", statusFilter))
          }
          projectsQuery = query(projectsQuery, orderBy("deliveryDate", "asc"))

          const projectsSnapshot = await getDocs(projectsQuery)
          const companyProjects = projectsSnapshot.docs.map((doc) => ({
            id_doc: doc.id, // Usamos apenas doc.id como fonte do id
            ...doc.data(), // Spread dos dados do documento
          })) as Project[]

          allProjects = [...allProjects, ...companyProjects]
        }

        if (searchTerm) {
          allProjects = allProjects.filter(
            (project) =>
              project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              project.leadership.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        setProjects(allProjects)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [searchTerm, statusFilter])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = auth.currentUser
      if (!user) return

      const newProject: Project = {
        id: "",
        employeeNames: formData.employeeNames.split(",").map((name) => name.trim()),
        employeeCount: formData.employeeCount,
        employeeFunction: formData.employeeFunction,
        employeeTable: formData.employeeTable,
        income: formData.income,
        expenses: formData.expenses,
        clientName: formData.clientName,
        projectName: formData.projectName,
        responsibleEmployees: formData.responsibleEmployees.split(",").map((name) => name.trim()),
        leadership: formData.leadership,
        deliveryDate: formData.deliveryDate,
        completionDate: formData.completionDate || undefined,
        status: formData.status,
        deadlines: formData.deadlines,
      }

      const companiesSnapshot = await getDocs(collection(db, "users", user.uid, "companies"))
      const companyId = companiesSnapshot.docs[0].id

      const docRef = await addDoc(collection(db, "companies", companyId, "projects"), newProject)
      setProjects([...projects, { ...newProject, id: docRef.id }])
      setShowForm(false)
      setFormData({
        employeeNames: "",
        employeeCount: 0,
        employeeFunction: "",
        employeeTable: "",
        income: 0,
        expenses: 0,
        clientName: "",
        projectName: "",
        responsibleEmployees: "",
        leadership: "",
        deliveryDate: "",
        completionDate: "",
        status: "active" as "active" | "completed",
        deadlines: "",
      })
    } catch (error) {
      console.error("Error adding project:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
    } else if (status === "completed") {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
    }
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const isOverdue = (deliveryDate: string) => {
    if (!deliveryDate) return false
    const today = new Date()
    const delivery = new Date(deliveryDate)
    return delivery < today
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Card>
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="h-9 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Project</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                placeholder="Employee Names (comma-separated)"
                value={formData.employeeNames}
                onChange={(e) => setFormData({ ...formData, employeeNames: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Employee Count"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
              />
              <Input
                placeholder="Employee Function"
                value={formData.employeeFunction}
                onChange={(e) => setFormData({ ...formData, employeeFunction: e.target.value })}
              />
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setFormData({ ...formData, employeeTable: e.target.files?.[0]?.name || "" })}
              />
              <Input
                type="number"
                placeholder="Income (R$)"
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Expenses (R$)"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: Number(e.target.value) })}
              />
              <Input
                placeholder="Client Name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
              <Input
                placeholder="Project Name"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
              <Input
                placeholder="Responsible Employees (comma-separated)"
                value={formData.responsibleEmployees}
                onChange={(e) => setFormData({ ...formData, responsibleEmployees: e.target.value })}
              />
              <Input
                placeholder="Leadership"
                value={formData.leadership}
                onChange={(e) => setFormData({ ...formData, leadership: e.target.value })}
              />
              <Input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
              <Input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
              />
              <Input
                placeholder="Deadlines"
                value={formData.deadlines}
                onChange={(e) => setFormData({ ...formData, deadlines: e.target.value })}
              />
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "completed") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Project
              </Button>
            </form>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Leadership</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.leadership}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isOverdue(project.deliveryDate) && project.status !== "completed"
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {formatDate(project.deliveryDate)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}
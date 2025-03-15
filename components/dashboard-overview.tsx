"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { Building, Users, ClipboardList, TrendingUp, DollarSign, Clock } from "lucide-react"
import Link from "next/link"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    companies: 0,
    employees: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalIncome: 0,
    totalExpenses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        // This is a simplified version - in a real app, you'd need to fetch data
        // from all companies the user has access to
        const companiesSnapshot = await getDocs(collection(db, "users", user.uid, "companies"))

        const companies = companiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        let employeeCount = 0
        let activeProjectCount = 0
        let completedProjectCount = 0
        let income = 0
        let expenses = 0

        // For each company, fetch employees, projects, and financials
        for (const company of companies) {
          const employeesSnapshot = await getDocs(collection(db, "companies", company.id, "employees"))
          employeeCount += employeesSnapshot.size

          const activeProjectsSnapshot = await getDocs(
            query(collection(db, "companies", company.id, "projects"), where("status", "==", "active")),
          )
          activeProjectCount += activeProjectsSnapshot.size

          const completedProjectsSnapshot = await getDocs(
            query(collection(db, "companies", company.id, "projects"), where("status", "==", "completed")),
          )
          completedProjectCount += completedProjectsSnapshot.size

          const financialsSnapshot = await getDocs(collection(db, "companies", company.id, "financials"))

          financialsSnapshot.docs.forEach((doc) => {
            const data = doc.data()
            income += data.income || 0
            expenses += data.expense || 0
          })
        }

        setStats({
          companies: companies.length,
          employees: employeeCount,
          activeProjects: activeProjectCount,
          completedProjects: completedProjectCount,
          totalIncome: income,
          totalExpenses: expenses,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Mock data for charts
  const projectData = [
    { name: "Jan", active: 4, completed: 2 },
    { name: "Feb", active: 3, completed: 3 },
    { name: "Mar", active: 5, completed: 1 },
    { name: "Apr", active: 6, completed: 2 },
    { name: "May", active: 4, completed: 4 },
    { name: "Jun", active: 3, completed: 5 },
  ]

  const financialData = [
    { name: "Jan", income: 4000, expenses: 2400 },
    { name: "Feb", income: 3000, expenses: 1398 },
    { name: "Mar", income: 2000, expenses: 9800 },
    { name: "Apr", income: 2780, expenses: 3908 },
    { name: "May", income: 1890, expenses: 4800 },
    { name: "Jun", income: 2390, expenses: 3800 },
  ]

  const employeeRoleData = [
    { name: "Developers", value: 40 },
    { name: "Designers", value: 15 },
    { name: "Managers", value: 10 },
    { name: "QA", value: 20 },
    { name: "Other", value: 15 },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex space-x-2">
          <Link href="/company-registration">
            <Button className="bg-blue-600 hover:bg-blue-700">Register New Company</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
            <p className="text-xs text-muted-foreground">Total registered companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
            <p className="text-xs text-muted-foreground">Total employees across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Projects currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(stats.totalIncome - stats.totalExpenses).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total income minus expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart
                  data={projectData}
                  categories={["active", "completed"]}
                  index="name"
                  colors={["#4f46e5", "#10b981"]}
                  valueFormatter={(value) => `${value} projects`}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Completion Rate</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart
                  data={projectData.map((item) => ({
                    name: item.name,
                    rate: (item.completed / (item.active + item.completed)) * 100,
                  }))}
                  categories={["rate"]}
                  index="name"
                  colors={["#f59e0b"]}
                  valueFormatter={(value) => `${value.toFixed(0)}%`}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Overdue</span>
                    <span className="ml-auto text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Due this week</span>
                    <span className="ml-auto text-sm font-medium">3</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">On track</span>
                    <span className="ml-auto text-sm font-medium">8</span>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      View All Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart
                  data={financialData}
                  categories={["income", "expenses"]}
                  index="name"
                  colors={["#10b981", "#ef4444"]}
                  valueFormatter={(value) => `R$ ${value}`}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart
                  data={financialData.map((item) => ({
                    name: item.name,
                    balance: item.income - item.expenses,
                  }))}
                  categories={["balance"]}
                  index="name"
                  colors={["#3b82f6"]}
                  valueFormatter={(value) => `R$ ${value}`}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalIncome.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalIncome > 0
                    ? `${(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeProjects + stats.completedProjects > 0
                    ? `R$ ${(stats.totalIncome / (stats.activeProjects + stats.completedProjects)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : "R$ 0"}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={employeeRoleData} index="name" valueFormatter={(value) => `${value}%`} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Employees</p>
                      <p className="text-2xl font-bold">{stats.employees}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Projects per Employee</p>
                      <p className="text-2xl font-bold">
                        {stats.employees > 0
                          ? ((stats.activeProjects + stats.completedProjects) / stats.employees).toFixed(1)
                          : "0"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">{stats.activeProjects}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Completed Projects</p>
                      <p className="text-2xl font-bold">{stats.completedProjects}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      View All Employees
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


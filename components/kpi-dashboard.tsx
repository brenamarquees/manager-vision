"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart } from "@/components/charts"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock } from "lucide-react"

export function KpiDashboard() {
  const [timeRange, setTimeRange] = useState("month")

  // Mock data for KPIs
  const financialKpis = [
    { name: "Revenue Growth", target: 15, current: 12, unit: "%" },
    { name: "Profit Margin", target: 25, current: 22, unit: "%" },
    { name: "Cost Reduction", target: 10, current: 8, unit: "%" },
    { name: "Average Project Value", target: 50000, current: 45000, unit: "R$" },
  ]

  const projectKpis = [
    { name: "On-time Delivery", target: 95, current: 87, unit: "%" },
    { name: "Client Satisfaction", target: 90, current: 92, unit: "%" },
    { name: "Project Profitability", target: 30, current: 28, unit: "%" },
    { name: "Resource Utilization", target: 85, current: 78, unit: "%" },
  ]

  const employeeKpis = [
    { name: "Employee Productivity", target: 90, current: 85, unit: "%" },
    { name: "Training Completion", target: 100, current: 75, unit: "%" },
    { name: "Employee Satisfaction", target: 85, current: 82, unit: "%" },
    { name: "Retention Rate", target: 95, current: 92, unit: "%" },
  ]

  // Mock data for charts
  const revenueData = [
    { name: "Jan", value: 42000 },
    { name: "Feb", value: 38000 },
    { name: "Mar", value: 45000 },
    { name: "Apr", value: 50000 },
    { name: "May", value: 55000 },
    { name: "Jun", value: 60000 },
  ]

  const projectCompletionData = [
    { name: "Jan", onTime: 85, delayed: 15 },
    { name: "Feb", onTime: 80, delayed: 20 },
    { name: "Mar", onTime: 90, delayed: 10 },
    { name: "Apr", onTime: 88, delayed: 12 },
    { name: "May", onTime: 92, delayed: 8 },
    { name: "Jun", onTime: 87, delayed: 13 },
  ]

  const employeePerformanceData = [
    { name: "Jan", performance: 82 },
    { name: "Feb", performance: 84 },
    { name: "Mar", performance: 86 },
    { name: "Apr", performance: 83 },
    { name: "May", performance: 88 },
    { name: "Jun", performance: 90 },
  ]

  const renderKpiCard = (kpi: { name: string; target: number; current: number; unit: string }) => {
    const progress = (kpi.current / kpi.target) * 100
    const isPositive = kpi.current >= kpi.target
    const isClose = progress >= 80 && progress < 100

    let statusIcon
    if (isPositive) {
      statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />
    } else if (isClose) {
      statusIcon = <Clock className="h-5 w-5 text-yellow-500" />
    } else {
      statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />
    }

    const formatValue = (value: number) => {
      if (kpi.unit === "R$") {
        return `${kpi.unit} ${value.toLocaleString()}`
      }
      return `${value}${kpi.unit}`
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatValue(kpi.current)}</div>
              <p className="text-xs text-muted-foreground">Target: {formatValue(kpi.target)}</p>
            </div>
            {statusIcon}
          </div>
          <Progress value={Math.min(progress, 100)} className="mt-3 h-2" />
          <div className="mt-1 flex items-center text-xs">
            {progress >= 100 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={progress >= 100 ? "text-green-500" : "text-red-500"}>
              {progress.toFixed(0)}% of target
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {financialKpis.map((kpi, index) => (
              <div key={index}>{renderKpiCard(kpi)}</div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={revenueData}
                categories={["value"]}
                index="name"
                colors={["#3b82f6"]}
                valueFormatter={(value) => `R$ ${value.toLocaleString()}`}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projectKpis.map((kpi, index) => (
              <div key={index}>{renderKpiCard(kpi)}</div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={projectCompletionData}
                categories={["onTime", "delayed"]}
                index="name"
                colors={["#10b981", "#ef4444"]}
                valueFormatter={(value) => `${value}%`}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {employeeKpis.map((kpi, index) => (
              <div key={index}>{renderKpiCard(kpi)}</div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={employeePerformanceData}
                categories={["performance"]}
                index="name"
                colors={["#f59e0b"]}
                valueFormatter={(value) => `${value}%`}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


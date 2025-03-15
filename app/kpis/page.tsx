import { KpiDashboard } from "@/components/kpi-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function KPIs() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">KPIs & Indicadores de Performance</h1>
        <KpiDashboard />
      </div>
    </DashboardLayout>
  )
}


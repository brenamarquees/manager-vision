import { ProjectsTable } from "@/components/projects-table"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Projects</h1>
        <ProjectsTable />
      </div>
    </DashboardLayout>
  )
}


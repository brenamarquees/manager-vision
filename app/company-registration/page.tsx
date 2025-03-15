import { CompanyRegistrationForm } from "@/components/company-registration-form"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function CompanyRegistration() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Registre sua empresa</h1>
        <CompanyRegistrationForm />
      </div>
    </DashboardLayout>
  )
}


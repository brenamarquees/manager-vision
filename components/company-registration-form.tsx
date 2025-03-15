"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, setDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CsvImporter } from "@/components/csv-importer"

export function CompanyRegistrationForm() {
  const [companyName, setCompanyName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = auth.currentUser

      if (!user) {
        throw new Error("You must be logged in to register a company")
      }

      const companyId = Date.now().toString()

      await setDoc(doc(db, "companies", companyId), {
        name: companyName,
        description,
        address,
        phone,
        website,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      })

      // Also add this company to the user's companies
      await setDoc(doc(db, "users", user.uid, "companies", companyId), {
        companyId,
        role: "admin",
        addedAt: new Date().toISOString(),
      })

      toast({
        title: "Empresa Cadastrada",
        description: "Sua empresa foi cadastrada com sucesso.",
      })

      router.push(`/dashboard/company/${companyId}`)
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your company.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site</Label>
                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Registering..." : "Register Company"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar os dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CsvImporter />
        </CardContent>
      </Card>
    </div>
  )
}


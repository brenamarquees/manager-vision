import Link from "next/link"
import Image from "next/image"
import { RegistrationForm } from "@/components/registration-form"

export default function Register() {
  return (
    <div className="flex min-h-screen">
      {/* Left side with blue background and logo */}
      <div className="relative hidden w-1/2 bg-blue-600 lg:block">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -left-16 -top-16 h-4 w-4 rounded-full bg-white/30"></div>
            <div className="absolute -left-24 top-8 h-4 w-4 rounded-full bg-white/30"></div>
            <div className="relative h-32 w-32 rounded-full bg-blue-500">
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white">
                <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Image
            src="/placeholder.svg?height=200&width=100"
            alt="Business person"
            width={100}
            height={200}
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side with registration form */}
      <div className="flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">ManagerVision</h1>
            <p className="mt-2 text-sm text-gray-600">Crie sua conta</p>
          </div>
          <RegistrationForm />
          <div className="text-center text-sm">
            <p className="text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


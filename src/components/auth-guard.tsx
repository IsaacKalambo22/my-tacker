import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect("/login")
  }

  return <>{children}</>
}

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { UserRole } from "@/types/auth"
import { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export async function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect("/login")
  }

  const userRole = session.user.role as UserRole
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/unauthorized")
  }

  return <>{children}</>
}

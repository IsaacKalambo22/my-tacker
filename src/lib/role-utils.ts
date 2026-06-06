import { UserRole } from "@/types/auth"

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard"
    case UserRole.MANAGER:
      return "/dashboard"
    case UserRole.LEARNER:
      return "/dashboard"
    default:
      return "/dashboard"
  }
}

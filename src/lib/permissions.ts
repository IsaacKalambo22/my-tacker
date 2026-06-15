import { UserRole } from "@/types/auth"

export function canViewAnalytics(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER
}

export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.ADMIN
}

export function canViewAllSubjects(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER
}

export function canViewLearnerProgress(role: UserRole): boolean {
  return role === UserRole.MANAGER || role === UserRole.ADMIN
}

export function isLearner(role: UserRole): boolean {
  return role === UserRole.LEARNER
}

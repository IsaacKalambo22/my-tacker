export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  LEARNER = "LEARNER"
}

export interface AuthUser {
  id: string
  name: string | null
  email: string
  role: UserRole
  avatar: string | null
  createdAt: Date
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string | null
    role: UserRole
  }
}

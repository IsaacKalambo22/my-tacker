import { UserRole } from "@/types/auth"
import { 
  LayoutDashboardIcon, 
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  ChartBarIcon,
  UsersIcon, 
  Settings2Icon, 
  MapIcon,
  StarIcon,
} from "lucide-react"

export interface RoleMenuItem {
  title: string
  url: string
  icon: React.ReactNode
}

export const roleMenus: Record<UserRole, RoleMenuItem[]> = {
  [UserRole.ADMIN]: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "Learning Subjects",
      url: "/dashboard/subjects",
      icon: <BookOpenIcon />
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <ChartBarIcon />
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <UsersIcon />
    },
  ],
  [UserRole.MANAGER]: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "Learning Subjects",
      url: "/dashboard/subjects",
      icon: <BookOpenIcon />
    },
    {
      title: "Progress Tracking",
      url: "/dashboard/progress",
      icon: <TrendingUpIcon />
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <ChartBarIcon />
    },
  ],
  [UserRole.LEARNER]: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "Learning Subjects",
      url: "/dashboard/subjects",
      icon: <BookOpenIcon />
    },
    {
      title: "Roadmaps",
      url: "/dashboard/learning-path",
      icon: <MapIcon />
    },
    {
      title: "Progress Tracking",
      url: "/dashboard/progress",
      icon: <TrendingUpIcon />
    },
    {
      title: "Achievements",
      url: "/dashboard/achievements",
      icon: <StarIcon />
    },
  ],
}

export const secondaryMenus: RoleMenuItem[] = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />
  },
]

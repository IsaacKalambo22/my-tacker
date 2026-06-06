import { UserRole } from "@/types/auth"
import { 
  LayoutDashboardIcon, 
  ListIcon, 
  ChartBarIcon, 
  FolderIcon, 
  UsersIcon, 
  Settings2Icon, 
  CircleHelpIcon, 
  SearchIcon,
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  ShieldIcon,
  FileTextIcon
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
      title: "Users",
      url: "/dashboard/users",
      icon: <UsersIcon />
    },
    {
      title: "Subjects",
      url: "/dashboard/subjects",
      icon: <BookOpenIcon />
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <ChartBarIcon />
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <FileTextIcon />
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />
    },
  ],
  [UserRole.MANAGER]: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: <UsersIcon />
    },
    {
      title: "Progress",
      url: "/dashboard/progress",
      icon: <TrendingUpIcon />
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <FileTextIcon />
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />
    },
  ],
  [UserRole.LEARNER]: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "My Subjects",
      url: "/dashboard/subjects",
      icon: <BookOpenIcon />
    },
    {
      title: "Learning Path",
      url: "/dashboard/learning-path",
      icon: <GraduationCapIcon />
    },
    {
      title: "Progress",
      url: "/dashboard/progress",
      icon: <TrendingUpIcon />
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: <CircleHelpIcon />
    },
  ],
}

export const secondaryMenus: RoleMenuItem[] = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />
  },
  {
    title: "Get Help",
    url: "/dashboard/help",
    icon: <CircleHelpIcon />
  },
  {
    title: "Search",
    url: "/dashboard/search",
    icon: <SearchIcon />
  },
]

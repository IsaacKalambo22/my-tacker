"use client"

import * as React from "react"
import { auth } from "@/lib/auth"
import { useAuthStore } from "@/store/auth-store"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon } from "lucide-react"
import { roleMenus, secondaryMenus, type RoleMenuItem } from "@/lib/role-menu"
import { UserRole } from "@/types/auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const [menuItems, setMenuItems] = React.useState<RoleMenuItem[]>([])
  const [userRole, setUserRole] = React.useState<UserRole | null>(null)

  React.useEffect(() => {
    async function loadSession() {
      const session = await auth()
      if (session?.user) {
        setUserRole(session.user.role as UserRole)
        setMenuItems(roleMenus[session.user.role as UserRole] || [])
      }
    }
    loadSession()
  }, [])

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.avatar || "/avatars/default.jpg",
    role: userRole || undefined,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Tech Tracker</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
        <NavSecondary items={secondaryMenus} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

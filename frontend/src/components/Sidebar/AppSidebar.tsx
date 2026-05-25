import {
  Home,
  Users,
  Truck,
  Plus,
  Map,
  History,
  BarChart,
  FileText,
  Settings,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home, title: "Dashboard", path: "/" },
  { header: "DELIVERIES", icon: Truck, title: "Deliveries", path: "/deliveries" },
  { icon: Plus, title: "Create Delivery", path: "/deliveries/create" },
  { header: "ROUTE MANAGEMENT", icon: Map, title: "Optimize Route", path: "/optimize-route" },
  { icon: History, title: "Route History", path: "/route-history" },
  { header: "ANALYTICS", icon: BarChart, title: "Analytics", path: "/analytics" },
  { icon: FileText, title: "Reports", path: "/reports" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [
        ...baseItems,
        { header: "SYSTEM", icon: Users, title: "Users", path: "/admin/users" },
        { icon: Settings, title: "Settings", path: "/admin/settings" },
      ]
    : baseItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar

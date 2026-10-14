import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

interface UserProfile {
  id: number
  name: string
  email: string
  profile_photo_url?: string | null
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: UserProfile }>(
        '/user'
      )
      return res.data.data
    },
  })

  const sidebarUser = {
    name: profile?.name ?? sidebarData.user.name,
    email: profile?.email ?? sidebarData.user.email,
    avatar: profile?.profile_photo_url ?? sidebarData.user.avatar,
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

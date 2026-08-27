import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Flag,
  ScrollText,
  MessageSquareText,
  Star,
  ShieldAlert,
  Settings2,
} from 'lucide-react'
import { HanapBuhayLogo } from '@/assets/logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@hanapbuhay.com',
    avatar: '',
  },
  teams: [
    {
      name: 'HanapBuhay',
      logo: HanapBuhayLogo,
      plan: 'Admin Panel',
    },
  ],
  navGroups: [
    {
      title: 'HanapBuhay',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Verifications',
          url: '/verifications',
          icon: ShieldAlert,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Bookings',
          url: '/bookings',
          icon: CalendarDays,
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: Flag,
        },
        {
          title: 'Chat Logs',
          url: '/chat-logs',
          icon: MessageSquareText,
        },
        {
          title: 'Reviews',
          url: '/reviews',
          icon: Star,
        },
        {
          title: 'Audit Log',
          url: '/audit-logs',
          icon: ScrollText,
        },
        {
          title: 'Platform Settings',
          url: '/platform-settings',
          icon: Settings2,
        },
      ],
    },
  ],
}

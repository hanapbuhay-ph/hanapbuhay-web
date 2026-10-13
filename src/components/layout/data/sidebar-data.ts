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
  Briefcase,
  Bell,
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
      title: 'OVERVIEW',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Job Posts',
          url: '/job-posts',
          icon: Briefcase,
        },
        {
          title: 'Bookings',
          url: '/bookings',
          icon: CalendarDays,
        },
      ],
    },
    {
      title: 'TRUST & SAFETY',
      items: [
        {
          title: 'Verifications',
          url: '/verifications',
          icon: ShieldAlert,
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: Flag,
        },
        {
          title: 'Reviews',
          url: '/reviews',
          icon: Star,
        },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        {
          title: 'Chat Logs',
          url: '/chat-logs',
          icon: MessageSquareText,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          title: 'Notifications',
          url: '/notifications',
          icon: Bell,
        },
        {
          title: 'Audit Logs and Security Logs',
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

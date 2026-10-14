import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { AdminNotification, AdminNotificationPage } from '../types'

const PAGE_SIZE = 20
const notificationQueryKey = ['admin-notifications', PAGE_SIZE]

type NotificationResponse = { data: AdminNotificationPage }

async function fetchNotifications(
  cursor?: string
): Promise<AdminNotificationPage> {
  const response = await api.get<NotificationResponse>('/admin/notifications', {
    params: { per_page: PAGE_SIZE, ...(cursor ? { cursor } : {}) },
  })
  return response.data.data
}

export function useAdminNotifications(options: { poll?: boolean } = {}) {
  const queryClient = useQueryClient()
  const [olderNotifications, setOlderNotifications] = useState<
    AdminNotification[]
  >([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasLoadedMore, setHasLoadedMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const query = useQuery({
    queryKey: notificationQueryKey,
    queryFn: () => fetchNotifications(),
    refetchInterval: options.poll ? 30_000 : false,
    refetchIntervalInBackground: false,
  })

  const firstPage = query.data
  const notifications = [
    ...(firstPage?.notifications ?? []),
    ...olderNotifications.filter(
      (older) => !firstPage?.notifications.some((item) => item.id === older.id)
    ),
  ]
  const cursor = hasLoadedMore ? nextCursor : firstPage?.pagination.next_cursor

  const load = async () => {
    setOlderNotifications([])
    setHasLoadedMore(false)
    setNextCursor(null)
    await query.refetch()
  }

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const page = await fetchNotifications(cursor)
      setOlderNotifications((current) => {
        const existingIds = new Set(current.map((item) => item.id))
        return [
          ...current,
          ...page.notifications.filter((item) => !existingIds.has(item.id)),
        ]
      })
      setNextCursor(page.pagination.next_cursor)
      setHasLoadedMore(true)
    } catch {
      toast.error('Could not load older notifications.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const markRead = async (notification: AdminNotification) => {
    if (notification.is_read) return

    try {
      await api.post(`/admin/notifications/${notification.id}/read`)
      queryClient.setQueryData<AdminNotificationPage>(
        notificationQueryKey,
        (current) =>
          current && {
            ...current,
            notifications: current.notifications.map((item) =>
              item.id === notification.id ? { ...item, is_read: true } : item
            ),
            unread_count: Math.max(0, current.unread_count - 1),
          }
      )
      setOlderNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      )
    } catch {
      toast.error('Could not mark this notification as read.')
      throw new Error('Mark notification as read failed.')
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/admin/notifications/read-all')
      queryClient.setQueryData<AdminNotificationPage>(
        notificationQueryKey,
        (current) =>
          current && {
            ...current,
            notifications: current.notifications.map((item) => ({
              ...item,
              is_read: true,
            })),
            unread_count: 0,
          }
      )
      setOlderNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      )
    } catch {
      toast.error('Could not mark notifications as read.')
    }
  }

  const deleteOne = async (id: number) => {
    const notification = notifications.find((item) => item.id === id)
    try {
      await api.delete(`/admin/notifications/${id}`)
      queryClient.setQueryData<AdminNotificationPage>(
        notificationQueryKey,
        (current) =>
          current && {
            ...current,
            notifications: current.notifications.filter(
              (item) => item.id !== id
            ),
            unread_count: Math.max(
              0,
              current.unread_count -
                (notification && !notification.is_read ? 1 : 0)
            ),
          }
      )
      setOlderNotifications((current) =>
        current.filter((item) => item.id !== id)
      )
    } catch {
      toast.error('Could not delete this notification.')
    }
  }

  const deleteAll = async () => {
    try {
      await api.delete('/admin/notifications')
      queryClient.setQueryData<AdminNotificationPage>(
        notificationQueryKey,
        (current) =>
          current && {
            ...current,
            notifications: [],
            unread_count: 0,
            pagination: { next_cursor: null, has_more: false },
          }
      )
      setOlderNotifications([])
      setNextCursor(null)
      setHasLoadedMore(true)
    } catch {
      toast.error('Could not clear notifications.')
    }
  }

  return {
    notifications,
    unreadCount: firstPage?.unread_count ?? 0,
    hasMore: Boolean(cursor),
    isLoading: query.isLoading,
    isLoadingMore,
    error: query.isError,
    load,
    loadMore,
    markRead,
    markAllRead,
    deleteOne,
    deleteAll,
  }
}

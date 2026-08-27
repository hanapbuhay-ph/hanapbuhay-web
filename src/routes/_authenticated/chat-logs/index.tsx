import { createFileRoute } from '@tanstack/react-router'
import { ChatLogsListPage } from '@/features/chat-logs/list-page'

export const Route = createFileRoute('/_authenticated/chat-logs/')({
  component: ChatLogsListPage,
})

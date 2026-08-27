import { createFileRoute } from '@tanstack/react-router'
import { ChatLogDetailPage } from '@/features/chat-logs/detail-page'

export const Route = createFileRoute('/_authenticated/chat-logs/$id')({
  // Declare the ?from= search param so the router validates and types it
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === 'string' ? search.from : undefined,
  }),
  component: function ChatLogDetailRoute() {
    const { id } = Route.useParams()
    return <ChatLogDetailPage bookingId={id} />
  },
})

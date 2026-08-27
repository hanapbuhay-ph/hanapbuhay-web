import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsListPage } from '@/features/audit-logs/list-page'

export const Route = createFileRoute('/_authenticated/audit-logs/')({
  component: AuditLogsListPage,
})

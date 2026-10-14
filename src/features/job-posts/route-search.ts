import {
  type JobPostStatusFilter,
  type JobPostVerificationFilter,
} from './types'

export interface JobPostsSearch {
  workerId?: string
  workerPage?: number
  workerSearch?: string
  barangayId?: number
  verification?: JobPostVerificationFilter
  categoryId?: number
  postStatus?: JobPostStatusFilter
  postSearch?: string
  postPage?: number
}

function positiveInteger(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function validateJobPostsSearch(
  search: Record<string, unknown>,
): JobPostsSearch {
  const verification =
    search.verification === 'verified' || search.verification === 'unverified'
      ? search.verification
      : 'all'
  const postStatus =
    search.postStatus === 'active' || search.postStatus === 'inactive'
      ? search.postStatus
      : 'all'

  return {
    workerId:
      typeof search.workerId === 'string' && /^\d+$/.test(search.workerId)
        ? search.workerId
        : undefined,
    workerPage: positiveInteger(search.workerPage),
    workerSearch:
      typeof search.workerSearch === 'string' ? search.workerSearch : undefined,
    barangayId: positiveInteger(search.barangayId),
    verification,
    categoryId: positiveInteger(search.categoryId),
    postStatus,
    postSearch:
      typeof search.postSearch === 'string' ? search.postSearch : undefined,
    postPage: positiveInteger(search.postPage),
  }
}

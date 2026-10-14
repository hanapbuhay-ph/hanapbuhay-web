import { AxiosError } from 'axios'
import { toast } from 'sonner'

function extractErrorMessage(error: unknown): string | null {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data

    if (
      typeof responseData?.title === 'string' &&
      responseData.title.length > 0
    ) {
      return responseData.title
    }

    if (
      typeof responseData?.message === 'string' &&
      responseData.message.length > 0
    ) {
      return responseData.message
    }

    if (
      typeof responseData?.error === 'string' &&
      responseData.error.length > 0
    ) {
      return responseData.error
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'errors' in responseData
    ) {
      const errors = responseData.errors
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors).flatMap((value) =>
          Array.isArray(value) ? value : [value]
        )[0]

        if (typeof firstError === 'string' && firstError.length > 0) {
          return firstError
        }
      }
    }

    // No usable API message — fall back to generic
    return null
  }
}

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  const apiMessage = extractErrorMessage(error)
  if (apiMessage) {
    errMsg = apiMessage
  }

  toast.error(errMsg)
}

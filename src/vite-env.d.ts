/// <reference types="vite/client" />

interface GoogleCredentialResponse {
  credential: string
}

interface Window {
  Pusher?: typeof import('pusher-js').default
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string
          callback: (response: GoogleCredentialResponse) => void
        }) => void
        renderButton: (
          element: HTMLElement,
          options: Record<string, string | number>
        ) => void
        cancel: () => void
      }
    }
  }
}

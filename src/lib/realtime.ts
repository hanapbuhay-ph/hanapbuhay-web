import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const pushKey = import.meta.env.VITE_PUSHER_KEY || 'hanapbuhay-key'
const pushHost = import.meta.env.VITE_PUSHER_HOST || '127.0.0.1'
const pushPort = Number(import.meta.env.VITE_PUSHER_PORT || 6001)
const pushScheme = import.meta.env.VITE_PUSHER_SCHEME || 'http'
const pushCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1'

const isSecure = pushScheme === 'https'

if (!window.Pusher) {
  window.Pusher = Pusher
}

export const echo = new Echo({
  broadcaster: 'pusher',
  key: pushKey,
  cluster: pushCluster,
  forceTLS: isSecure,
  wsHost: pushHost,
  wsPort: pushPort,
  wssPort: pushPort,
  enabledTransports: ['ws', 'wss'],
  disabledTransports: ['sockjs'],
  authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/broadcasting/auth`,
  auth: {
    headers: {
      Accept: 'application/json',
    },
  },
})

export function subscribeToAdminPanel(onEvent: () => void) {
  const channel = echo.private('admin-panel')

  channel.listen('.AdminEntityChanged', () => {
    onEvent()
  })

  return () => {
    channel.stopListening('.AdminEntityChanged')
  }
}

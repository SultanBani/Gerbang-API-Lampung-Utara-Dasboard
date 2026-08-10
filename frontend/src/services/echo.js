import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echoInstance = null

try {
  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'qwertyuiop',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
  })
} catch (e) {
  console.warn('Echo websocket listener disabled:', e)
}

// Fallback dummy object if Echo fails to instantiate
export default echoInstance || {
  private: () => ({
    notification: () => ({}),
    listen: () => ({}),
  }),
}

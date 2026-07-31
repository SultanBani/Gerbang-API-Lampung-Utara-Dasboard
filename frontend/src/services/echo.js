// Optional WebSocket / Echo helper with graceful fallback
let echoInstance = null

try {
  // Dynamically load Echo if available
  const EchoModule = await import('laravel-echo').catch(() => null)
  const PusherModule = await import('pusher-js').catch(() => null)

  if (EchoModule && PusherModule) {
    const Echo = EchoModule.default
    const Pusher = PusherModule.default
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
  }
} catch (e) {
  console.warn('Echo websocket listener disabled:', e)
}

// Fallback dummy object if Echo is not available to prevent crashes
export default echoInstance || {
  private: () => ({
    notification: () => ({}),
    listen: () => ({}),
  }),
}

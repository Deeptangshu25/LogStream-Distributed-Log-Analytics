const WS_URL = 'ws://localhost:8081/ws/logs'

class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = new Set()
  }

  connect() {
    if (
      this.socket &&
      (
        this.socket.readyState ===
          WebSocket.OPEN ||
        this.socket.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return
    }

    const socket = new WebSocket(
      WS_URL
    )

    this.socket = socket

    socket.onopen = () => {
      console.log(
        'WebSocket connected'
      )
    }

    socket.onmessage = (event) => {
      try {
        const log = JSON.parse(
          event.data
        )

        this.listeners.forEach(
          (listener) => {
            listener(log)
          }
        )
      } catch (error) {
        console.error(
          'Failed to parse WebSocket message:',
          error
        )
      }
    }

    socket.onerror = (error) => {
      console.error(
        'WebSocket error:',
        error
      )
    }

    socket.onclose = () => {
      console.log(
        'WebSocket disconnected'
      )

      /*
       * Only clear the current socket.
       * An older socket must not clear
       * a newer connection.
       */
      if (this.socket === socket) {
        this.socket = null
      }
    }
  }

  disconnect() {
    const socket = this.socket

    if (socket) {
      this.socket = null
      socket.close()
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  isConnected() {
    return (
      this.socket !== null &&
      this.socket.readyState ===
        WebSocket.OPEN
    )
  }
}

export default new WebSocketService()
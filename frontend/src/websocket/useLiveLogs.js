import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import websocketService from './websocketService'

export function useLiveLogs(
  maxLogs = 100,
  websocketEnabled = true
) {
  const [logs, setLogs] = useState([])
  const [connected, setConnected] = useState(
    websocketService.isConnected()
  )
  const [paused, setPaused] = useState(false)

  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  /*
   * =========================================================
   * HANDLE INCOMING LOG
   * =========================================================
   */

  const handleLog = useCallback(
    (log) => {
      if (!log) {
        return
      }

      /*
       * When paused, keep the WebSocket connected
       * but don't add incoming logs to the UI.
       */
      if (pausedRef.current) {
        return
      }

      setLogs((currentLogs) => {
        const updatedLogs = [
          log,
          ...currentLogs,
        ]

        return updatedLogs.slice(
          0,
          maxLogs
        )
      })
    },
    [maxLogs]
  )

  /*
   * =========================================================
   * WEBSOCKET CONNECTION
   * =========================================================
   */

  useEffect(() => {
    /*
     * WebSocket disabled from Settings
     */
    if (!websocketEnabled) {
      websocketService.disconnect()
      setConnected(false)

      return undefined
    }

    /*
     * Subscribe to incoming logs
     */
    const unsubscribe =
      websocketService.subscribe(
        handleLog
      )

    /*
     * Connect
     */
    websocketService.connect()

    /*
     * Check connection state.
     *
     * WebSocket's onopen happens asynchronously,
     * so check periodically until connected.
     */
    const connectionChecker =
      setInterval(() => {
        setConnected(
          websocketService.isConnected()
        )
      }, 250)

    /*
     * Cleanup
     */
    return () => {
      clearInterval(
        connectionChecker
      )

      unsubscribe()

      websocketService.disconnect()

      setConnected(false)
    }
  }, [
    websocketEnabled,
    handleLog,
  ])

  /*
   * =========================================================
   * PAUSE / RESUME
   * =========================================================
   */

  const togglePaused = useCallback(() => {
    setPaused((current) => !current)
  }, [])

  /*
   * =========================================================
   * CLEAR LOGS
   * =========================================================
   */

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  /*
   * =========================================================
   * RETURN
   * =========================================================
   */

  return {
    logs,
    connected,
    paused,
    togglePaused,
    clearLogs,
  }
}
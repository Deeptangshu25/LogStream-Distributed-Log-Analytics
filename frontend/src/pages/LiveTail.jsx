import {
  Activity,
  AlertCircle,
  Clock3,
  Pause,
  Play,
  Radio,
  Server,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'

import { useLiveLogs } from '../websocket/useLiveLogs'
import { useLogStreamSettings } from '../hooks/useLogStreamSettings'

const levelStyles = {
  ERROR: {
    badge:
      'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
    glow:
      'shadow-[0_0_12px_rgba(248,113,113,0.35)]',
  },

  WARN: {
    badge:
      'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
    glow:
      'shadow-[0_0_12px_rgba(251,191,36,0.25)]',
  },

  INFO: {
    badge:
      'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    dot: 'bg-cyan-400',
    glow:
      'shadow-[0_0_12px_rgba(34,211,238,0.25)]',
  },

  DEBUG: {
    badge:
      'border-slate-500/20 bg-slate-500/10 text-slate-400',
    dot: 'bg-slate-400',
    glow: '',
  },
}

function LiveTail() {
  /*
   * =========================================================
   * LOGSTREAM SETTINGS
   * =========================================================
   */

  const {
    websocket,
    animations,
    compactMode,
  } = useLogStreamSettings()

  /*
   * =========================================================
   * LIVE LOGS
   * =========================================================
   *
   * websocket is passed here so the Settings toggle
   * actually controls the WebSocket connection.
   */

  const {
    logs,
    connected,
    paused,
    togglePaused,
    clearLogs,
  } = useLiveLogs(
    100,
    websocket
  )

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return '-'
    }

    return new Date(
      timestamp
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatResponseTime = (value) => {
    const response =
      Number(value) || 0

    if (response >= 1000) {
      return `${(
        response / 1000
      ).toFixed(2)} s`
    }

    return `${response} ms`
  }

  const getResponseClass = (value) => {
    const response =
      Number(value) || 0

    if (response >= 1000) {
      return 'text-red-400'
    }

    if (response >= 500) {
      return 'text-amber-400'
    }

    return 'text-slate-400'
  }

  /*
   * =========================================================
   * LIVE METRICS
   * =========================================================
   */

  const errorCount = logs.filter(
    (log) => log.level === 'ERROR'
  ).length

  const warnCount = logs.filter(
    (log) => log.level === 'WARN'
  ).length

  const infoCount = logs.filter(
    (log) => log.level === 'INFO'
  ).length

  /*
   * =========================================================
   * LAYOUT SETTINGS
   * =========================================================
   */

  const pageSpacing = compactMode
    ? 'space-y-4'
    : 'space-y-6'

  return (
    <div className={pageSpacing}>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Observability
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-600" />

            <span className="text-xs text-slate-500">
              Live Stream
            </span>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
              <Activity className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Live Tail
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Monitor incoming logs in real time.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            CONNECTION STATUS
        ================================================= */}

        <div
          className={`flex w-fit items-center gap-3 rounded-xl border px-4 py-3 ${
            !websocket
              ? 'border-slate-700 bg-slate-900/70'
              : connected
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-red-500/20 bg-red-500/5'
          }`}
        >

          <div
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${
              !websocket
                ? 'bg-slate-800'
                : connected
                  ? 'bg-emerald-500/10'
                  : 'bg-red-500/10'
            }`}
          >

            {!websocket ? (
              <WifiOff className="h-4 w-4 text-slate-500" />
            ) : connected ? (
              <>
                {animations && (
                  <span className="absolute inset-0 animate-ping rounded-lg bg-emerald-400/10" />
                )}

                <Wifi className="relative h-4 w-4 text-emerald-400" />
              </>
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}

          </div>

          <div>

            <p
              className={`text-sm font-semibold ${
                !websocket
                  ? 'text-slate-500'
                  : connected
                    ? 'text-emerald-400'
                    : 'text-red-400'
              }`}
            >
              {!websocket
                ? 'WebSocket Disabled'
                : connected
                  ? 'Connected'
                  : 'Disconnected'}
            </p>

            <p className="text-[11px] text-slate-500">
              {!websocket
                ? 'Enable from Settings'
                : 'WebSocket stream'}
            </p>

          </div>
        </div>
      </div>

      {/* =====================================================
          LIVE METRICS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur">

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />

          <div className="relative flex items-center justify-between">

            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Radio className="h-4 w-4 text-cyan-400" />
            </div>

            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Stream
            </span>

          </div>

          <p className="relative mt-4 text-xs text-slate-500">
            Buffered Logs
          </p>

          <p className="relative mt-1 text-2xl font-bold text-white">
            {logs.length}
          </p>

        </div>

        {/* INFO */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur">

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />

          <div className="relative flex items-center justify-between">

            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>

            <span className="h-2 w-2 rounded-full bg-cyan-400" />

          </div>

          <p className="relative mt-4 text-xs text-slate-500">
            Info Events
          </p>

          <p className="relative mt-1 text-2xl font-bold text-white">
            {infoCount}
          </p>

        </div>

        {/* WARNINGS */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur">

          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />

          <div className="relative flex items-center justify-between">

            <div className="rounded-lg bg-amber-500/10 p-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>

            <span className="h-2 w-2 rounded-full bg-amber-400" />

          </div>

          <p className="relative mt-4 text-xs text-slate-500">
            Warnings
          </p>

          <p className="relative mt-1 text-2xl font-bold text-white">
            {warnCount}
          </p>

        </div>

        {/* ERRORS */}

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur">

          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />

          <div className="relative flex items-center justify-between">

            <div className="rounded-lg bg-red-500/10 p-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>

            <span
              className={`h-2 w-2 rounded-full ${
                errorCount > 0
                  ? animations
                    ? 'animate-pulse bg-red-400'
                    : 'bg-red-400'
                  : 'bg-slate-600'
              }`}
            />

          </div>

          <p className="relative mt-4 text-xs text-slate-500">
            Errors
          </p>

          <p className="relative mt-1 text-2xl font-bold text-white">
            {errorCount}
          </p>

        </div>

      </div>

      {/* =====================================================
          STREAM CONTROL BAR
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur">

        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.025] via-transparent to-purple-500/[0.025]" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* STATUS */}

          <div className="flex items-center gap-4">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                !websocket
                  ? 'bg-slate-800'
                  : connected
                    ? 'bg-emerald-500/10'
                    : 'bg-red-500/10'
              }`}
            >

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  !websocket
                    ? 'bg-slate-600'
                    : connected
                      ? paused
                        ? 'bg-amber-400'
                        : animations
                          ? 'animate-pulse bg-emerald-400'
                          : 'bg-emerald-400'
                      : 'bg-red-400'
                }`}
              />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <p className="text-sm font-semibold text-white">
                  {!websocket
                    ? 'WebSocket disabled'
                    : paused
                      ? 'Stream paused'
                      : connected
                        ? 'Receiving live logs'
                        : 'Waiting for connection'}
                </p>

                {websocket &&
                  connected &&
                  !paused && (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      LIVE
                    </span>
                  )}

              </div>

              <p className="mt-0.5 text-xs text-slate-500">
                {!websocket
                  ? 'Enable WebSocket from Settings'
                  : `${logs.length} events currently buffered`}
              </p>

            </div>

          </div>

          {/* CONTROLS */}

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={togglePaused}
              disabled={!websocket}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                !websocket
                  ? 'cursor-not-allowed border-slate-800 bg-slate-900 text-slate-700'
                  : paused
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
              }`}
            >

              {paused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}

            </button>

            <button
              type="button"
              onClick={clearLogs}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          LOG STREAM
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-xl shadow-black/10">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-800/80 bg-slate-900/70 px-5 py-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-cyan-500/10 p-2">
                <Activity className="h-4 w-4 text-cyan-400" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="font-semibold text-white">
                    Incoming Logs
                  </h2>

                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    REAL-TIME
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Events received through the WebSocket connection.
                </p>

              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <Clock3 className="h-3.5 w-3.5" />

              <span>
                Showing latest {logs.length} events
              </span>

            </div>

          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          {logs.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-5">

              <div className="relative mb-5">

                {animations && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/10" />
                )}

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">

                  {!websocket ? (
                    <WifiOff className="h-7 w-7 text-slate-600" />
                  ) : (
                    <Activity className="h-7 w-7 text-slate-600" />
                  )}

                </div>
              </div>

              <p className="text-sm font-medium text-slate-400">

                {!websocket
                  ? 'WebSocket is disabled'
                  : paused
                    ? 'Live stream is paused'
                    : connected
                      ? 'Waiting for incoming logs'
                      : 'Waiting for connection'}

              </p>

              <p className="mt-1 text-xs text-slate-600">
                {!websocket
                  ? 'Enable WebSocket from Settings to receive live logs.'
                  : 'New events will appear here automatically.'}
              </p>

            </div>
          ) : (
            <table className="w-full min-w-[1050px] text-left">

              <thead>

                <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[10px] uppercase tracking-[0.16em] text-slate-600">

                  <th className="w-[130px] px-5 py-3 font-semibold">
                    Time
                  </th>

                  <th className="w-[110px] px-5 py-3 font-semibold">
                    Level
                  </th>

                  <th className="w-[180px] px-5 py-3 font-semibold">
                    Service
                  </th>

                  <th className="w-[150px] px-5 py-3 font-semibold">
                    Host
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Message
                  </th>

                  <th className="w-[130px] px-5 py-3 text-right font-semibold">
                    Response
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800/60">

                {logs.map(
                  (log, index) => {
                    const style =
                      levelStyles[
                        log.level
                      ] ||
                      levelStyles.INFO

                    return (
                      <tr
                        key={
                          log.id ||
                          index
                        }
                        className="group relative transition-colors duration-150 hover:bg-cyan-500/[0.025]"
                      >

                        {/* TIME */}

                        <td className="whitespace-nowrap px-5 py-3.5">

                          <div className="flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-slate-700 transition group-hover:bg-cyan-400" />

                            <span className="font-mono text-xs text-slate-400">
                              {formatTime(
                                log.timestamp
                              )}
                            </span>

                          </div>

                        </td>

                        {/* LEVEL */}

                        <td className="px-5 py-3.5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${style.badge} ${style.glow}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />

                            {log.level ||
                              'INFO'}

                          </span>

                        </td>

                        {/* SERVICE */}

                        <td className="px-5 py-3.5">

                          <div className="flex items-center gap-2">

                            <Server className="h-3.5 w-3.5 text-slate-600" />

                            <span className="whitespace-nowrap text-sm font-medium text-slate-300">
                              {log.service ||
                                '-'}
                            </span>

                          </div>

                        </td>

                        {/* HOST */}

                        <td className="px-5 py-3.5">

                          <span className="font-mono text-xs text-slate-500">
                            {log.host || '-'}
                          </span>

                        </td>

                        {/* MESSAGE */}

                        <td className="max-w-xl px-5 py-3.5">

                          <div
                            className="truncate text-sm text-slate-400 transition group-hover:text-slate-300"
                            title={
                              log.message ||
                              '-'
                            }
                          >
                            {log.message ||
                              '-'}
                          </div>

                        </td>

                        {/* RESPONSE */}

                        <td className="whitespace-nowrap px-5 py-3.5 text-right">

                          <span
                            className={`font-mono text-xs font-medium ${getResponseClass(
                              log.responseTimeMs
                            )}`}
                          >
                            {formatResponseTime(
                              log.responseTimeMs
                            )}
                          </span>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>
          )}

        </div>

        {/* FOOTER */}

        {logs.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-800/80 bg-slate-900/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-[11px] text-slate-600">

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  !websocket
                    ? 'bg-slate-600'
                    : connected
                      ? 'bg-emerald-400'
                      : 'bg-red-400'
                }`}
              />

              {!websocket
                ? 'WebSocket disabled'
                : connected
                  ? paused
                    ? 'Stream connected · paused'
                    : 'Stream connected · receiving events'
                  : 'Stream disconnected'}

            </div>

            <div className="text-[11px] text-slate-600">
              Maximum buffer: 100 logs
            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          LIVE STREAM INFORMATION
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* RESPONSE */}

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <Clock3 className="h-4 w-4 text-cyan-400" />

            Response monitoring

          </div>

          <p className="mt-2 text-sm text-slate-300">
            Slow requests are highlighted automatically.
          </p>

        </div>

        {/* PROCESSING */}

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <Zap className="h-4 w-4 text-amber-400" />

            Live processing

          </div>

          <p className="mt-2 text-sm text-slate-300">
            New backend events appear without refreshing.
          </p>

        </div>

        {/* WEBSOCKET */}

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">

            {websocket ? (
              <Wifi className="h-4 w-4 text-emerald-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-slate-500" />
            )}

            WebSocket

          </div>

          <p className="mt-2 text-sm text-slate-300">

            {websocket
              ? connected
                ? 'Real-time transport connected.'
                : 'Real-time transport enabled but disconnected.'
              : 'Real-time transport disabled from Settings.'}

          </p>

        </div>

      </div>

    </div>
  )
}

export default LiveTail
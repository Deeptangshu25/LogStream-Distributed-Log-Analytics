import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Radio,
  Server,
  X,
  Zap,
} from 'lucide-react'

import StatisticsCard from '../components/StatisticsCard'
import { getAnalytics } from '../services/analyticsService'
import { searchLogs } from '../services/searchService'
import { useLogStreamSettings } from '../hooks/useLogStreamSettings'

const levelStyles = {
  ERROR: {
    badge:
      'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },

  WARN: {
    badge:
      'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },

  INFO: {
    badge:
      'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    dot: 'bg-cyan-400',
  },

  DEBUG: {
    badge:
      'border-slate-500/20 bg-slate-500/10 text-slate-400',
    dot: 'bg-slate-400',
  },
}

const levelColors = {
  DEBUG: '#64748b',
  INFO: '#06b6d4',
  WARN: '#f59e0b',
  ERROR: '#ef4444',
}

function Dashboard() {
  const {
    animations,
    autoRefresh,
    recentLogs: showRecentLogs,
    compactMode,
  } = useLogStreamSettings()

  const [analytics, setAnalytics] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])

  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] =
    useState(true)

  const [error, setError] = useState('')
  const [logsError, setLogsError] = useState('')

  const [selectedLevel, setSelectedLevel] =
    useState(null)

  const [levelLogs, setLevelLogs] = useState([])

  const [levelLoading, setLevelLoading] =
    useState(false)

  const [levelError, setLevelError] =
    useState('')

  /*
   * =========================================================
   * LOAD ANALYTICS
   * =========================================================
   */

  useEffect(() => {
    let mounted = true

    async function loadAnalytics() {
      try {
        if (mounted) {
          setLoading(true)
          setError('')
        }

        const data = await getAnalytics()

        if (mounted) {
          setAnalytics(data)
        }
      } catch (err) {
        console.error(err)

        if (mounted) {
          setError(
            'Unable to load analytics data.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    if (!autoRefresh) {
      return () => {
        mounted = false
      }
    }

    const interval = setInterval(
      loadAnalytics,
      10000
    )

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [autoRefresh])

  /*
   * =========================================================
   * LOAD RECENT LOGS
   * =========================================================
   */

  useEffect(() => {
    if (!showRecentLogs) {
      return undefined
    }

    let mounted = true

    async function loadRecentLogs() {
      try {
        if (mounted) {
          setLogsLoading(true)
          setLogsError('')
        }

        const data = await searchLogs({
          page: 0,
          size: 100,
        })

        const logs = [
          ...(data.logs || []),
        ]

        logs.sort(
          (a, b) =>
            new Date(b.timestamp) -
            new Date(a.timestamp)
        )

        if (mounted) {
          setRecentLogs(
            logs.slice(0, 5)
          )
        }
      } catch (err) {
        console.error(err)

        if (mounted) {
          setLogsError(
            'Unable to load recent logs.'
          )
        }
      } finally {
        if (mounted) {
          setLogsLoading(false)
        }
      }
    }

    loadRecentLogs()

    return () => {
      mounted = false
    }
  }, [showRecentLogs])

  /*
   * =========================================================
   * ESC KEY
   * =========================================================
   */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLevelLogs()
      }
    }

    if (selectedLevel) {
      document.addEventListener(
        'keydown',
        handleEscape
      )
    }

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [selectedLevel])

  /*
   * =========================================================
   * VALUES
   * =========================================================
   */

  const totalLogs =
    Number(analytics?.totalLogs) || 0

  const errorCount =
    Number(analytics?.errorCount) || 0

  const warnCount =
    Number(analytics?.warnCount) || 0

  const infoCount =
    Number(analytics?.infoCount) || 0

  const debugCount =
    Number(analytics?.debugCount) || 0

  const averageResponse =
    Number(
      analytics?.averageResponseTimeMs
    ) || 0

  const activeServices =
    analytics?.logsByService
      ? Object.keys(
          analytics.logsByService
        ).length
      : 0

  const errorRate =
    totalLogs > 0
      ? (errorCount / totalLogs) * 100
      : 0

  const logLevels = useMemo(
    () => [
      {
        label: 'DEBUG',
        value: debugCount,
        color: levelColors.DEBUG,
      },
      {
        label: 'INFO',
        value: infoCount,
        color: levelColors.INFO,
      },
      {
        label: 'WARN',
        value: warnCount,
        color: levelColors.WARN,
      },
      {
        label: 'ERROR',
        value: errorCount,
        color: levelColors.ERROR,
      },
    ],
    [
      debugCount,
      infoCount,
      warnCount,
      errorCount,
    ]
  )

  const maxLevelValue = Math.max(
    ...logLevels.map(
      (item) => item.value
    ),
    1
  )

  /*
   * =========================================================
   * OPEN LEVEL LOGS
   * =========================================================
   */

  async function openLevelLogs(level) {
    try {
      setSelectedLevel(level)
      setLevelLoading(true)
      setLevelError('')
      setLevelLogs([])

      const result = await searchLogs({
        query: '',
        service: '',
        level,
        host: '',
        startTime: '',
        endTime: '',
        page: 0,
        size: 100,
      })

      const logs = [
        ...(result.logs || []),
      ]

      logs.sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )

      setLevelLogs(logs)
    } catch (err) {
      console.error(err)

      setLevelError(
        `Unable to load ${level} logs.`
      )
    } finally {
      setLevelLoading(false)
    }
  }

  /*
   * =========================================================
   * CLOSE LEVEL LOGS
   * =========================================================
   */

  function closeLevelLogs() {
    setSelectedLevel(null)
    setLevelLogs([])
    setLevelError('')
    setLevelLoading(false)
  }

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function formatTime(timestamp) {
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

  function getResponseColor(value) {
    const response =
      Number(value) || 0

    if (response >= 1000) {
      return 'text-red-400'
    }

    if (response >= 500) {
      return 'text-amber-400'
    }

    return 'text-slate-500'
  }

  const pageSpacing = compactMode
    ? 'space-y-4'
    : 'space-y-6'

  const gridGap = compactMode
    ? 'gap-3'
    : 'gap-5'

  const animationClass = animations
    ? 'transition-all duration-300'
    : ''

  return (
    <div className={pageSpacing}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/[0.04] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    animations
                      ? 'animate-pulse '
                      : ''
                  }bg-emerald-400`}
                />

                System Operational
              </span>

              <span className="text-[10px] text-slate-700">
                •
              </span>

              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Real-time observability
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              System Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor distributed logs,
              services, performance, and
              application health from one
              centralized view.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Radio className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Log Stream
              </p>

              <p className="mt-0.5 text-sm font-semibold text-white">
                {totalLogs.toLocaleString()}{' '}
                indexed events
              </p>
            </div>

            <ArrowUpRight className="ml-2 h-4 w-4 text-slate-700" />
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          title="Total Logs"
          value={
            loading
              ? '...'
              : totalLogs.toLocaleString()
          }
          change="Live"
          description="Indexed events"
          type="activity"
        />

        <StatisticsCard
          title="Errors"
          value={
            loading
              ? '...'
              : errorCount.toLocaleString()
          }
          change={
            totalLogs > 0
              ? `${errorRate.toFixed(1)}%`
              : '0%'
          }
          description="Error events"
          type="error"
        />

        <StatisticsCard
          title="Warnings"
          value={
            loading
              ? '...'
              : warnCount.toLocaleString()
          }
          change="Monitor"
          description="Warning events"
          type="warning"
        />

        <StatisticsCard
          title="Active Services"
          value={
            loading
              ? '...'
              : activeServices.toLocaleString()
          }
          change="Healthy"
          description="Indexed services"
          type="server"
        />
      </div>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className={`grid grid-cols-1 ${gridGap} xl:grid-cols-3`}
      >
        {/* LOG VOLUME */}

        <div
          className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur xl:col-span-2 ${animationClass}`}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/[0.035] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-500/[0.025] blur-3xl" />

          {animations && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-px animate-[chartScan_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          )}

          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">
                    Log Volume
                  </h2>

                  <span className="rounded-md border border-cyan-500/10 bg-cyan-500/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                    Interactive
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Click a severity to inspect
                  its logs
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] text-slate-600 sm:block">
                  {totalLogs} total events
                </span>

                <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 bottom-8 top-2 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map(
                  (line) => (
                    <div
                      key={line}
                      className="flex items-center gap-3"
                    >
                      <div className="h-px flex-1 border-t border-dashed border-slate-800/70" />

                      <span className="w-5 text-right text-[8px] text-slate-700">
                        {Math.round(
                          (maxLevelValue *
                            line) /
                            100
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="relative flex h-64 items-end gap-3 sm:gap-5">
                {logLevels.map(
                  (item, index) => {
                    const percentage =
                      (item.value /
                        maxLevelValue) *
                      100

                    const barHeight =
                      item.value === 0
                        ? 2
                        : Math.max(
                            percentage,
                            8
                          )

                    const share =
                      totalLogs > 0
                        ? (
                            (item.value /
                              totalLogs) *
                            100
                          ).toFixed(1)
                        : '0.0'

                    return (
                      <div
                        key={item.label}
                        onClick={() =>
                          openLevelLogs(
                            item.label
                          )
                        }
                        className="group/bar relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                        title={`View ${item.label} logs`}
                      >
                        {/* TOOLTIP */}

                        <div className="pointer-events-none absolute bottom-[calc(100%-18px)] left-1/2 z-30 -translate-x-1/2 translate-y-2 scale-95 whitespace-nowrap rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 opacity-0 shadow-2xl backdrop-blur transition-all duration-200 group-hover/bar:translate-y-0 group-hover/bar:scale-100 group-hover/bar:opacity-100">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  item.color,
                              }}
                            />

                            <span className="text-[11px] font-semibold text-white">
                              {item.label}
                            </span>
                          </div>

                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-sm font-bold text-white">
                              {item.value}
                            </span>

                            <span className="text-[9px] text-slate-500">
                              logs
                            </span>

                            <span className="ml-1 text-[9px] text-slate-600">
                              ({share}%)
                            </span>
                          </div>

                          <div className="mt-1 text-[9px] text-cyan-400">
                            Click to inspect →
                          </div>
                        </div>

                        {/* VALUE */}

                        <div
                          className={`relative z-10 mb-2 text-xs font-semibold text-slate-400 ${
                            animations
                              ? 'animate-[chartValueIn_500ms_ease-out_forwards]'
                              : ''
                          }`}
                          style={
                            animations
                              ? {
                                  animationDelay: `${
                                    400 +
                                    index *
                                      120
                                  }ms`,
                                }
                              : undefined
                          }
                        >
                          {item.value}
                        </div>

                        {/* BAR */}

                        <div className="relative flex h-full w-full items-end">
                          <div className="absolute inset-x-0 bottom-0 h-full rounded-t-xl bg-slate-950/30" />

                          <div
                            className="absolute inset-x-0 bottom-0 rounded-t-xl opacity-0 blur-xl transition-all duration-300 group-hover/bar:opacity-30"
                            style={{
                              height: `${barHeight}%`,
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <div
                            className={`relative w-full origin-bottom overflow-hidden rounded-t-xl ${
                              animations
                                ? 'animate-[chartBarIn_700ms_cubic-bezier(.22,1,.36,1)_forwards]'
                                : 'opacity-100'
                            } transition-all duration-300 group-hover/bar:scale-x-[1.04] group-hover/bar:brightness-125`}
                            style={{
                              height: `${barHeight}%`,
                              background: `
                                linear-gradient(
                                  180deg,
                                  ${item.color} 0%,
                                  ${item.color}dd 65%,
                                  ${item.color}99 100%
                                )
                              `,
                              boxShadow:
                                item.value >
                                0
                                  ? `0 -4px 22px ${item.color}30`
                                  : 'none',
                              ...(animations
                                ? {
                                    animationDelay: `${
                                      index *
                                      120
                                    }ms`,
                                  }
                                : {}),
                            }}
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-white/40" />

                            {animations &&
                              item.value >
                                0 && (
                                <div
                                  className="absolute inset-x-0 -top-10 h-16 animate-[barShine_3s_ease-in-out_infinite] bg-gradient-to-b from-white/20 to-transparent"
                                  style={{
                                    animationDelay: `${index * 500}ms`,
                                  }}
                                />
                              )}
                          </div>

                          {item.value > 0 && (
                            <div
                              className="absolute h-1 w-3/4 rounded-full opacity-80 blur-[2px]"
                              style={{
                                bottom: `${barHeight}%`,
                                left: '12.5%',
                                backgroundColor:
                                  item.color,
                                boxShadow: `0 0 12px ${item.color}`,
                              }}
                            />
                          )}
                        </div>

                        {/* LABEL */}

                        <div className="mt-3 flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <span className="text-[10px] font-semibold tracking-wide text-slate-500 transition-colors group-hover/bar:text-white">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4">
              <div className="flex items-center gap-4">
                {logLevels.map(
                  (item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        openLevelLogs(
                          item.label
                        )
                      }
                      className="flex items-center gap-1.5 transition hover:text-white"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      <span className="text-[9px] text-slate-600 hover:text-slate-300">
                        {item.label}
                      </span>
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    animations
                      ? 'animate-pulse '
                      : ''
                  }bg-cyan-400`}
                />

                Click a bar to inspect logs
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM HEALTH */}

        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  System Health
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current service status
                </p>
              </div>

              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Server className="h-4 w-4 text-emerald-400" />
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] p-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  {animations && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  )}

                  <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-white">
                    All Systems Operational
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    3 services monitored
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Healthy
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: 'Backend API',
                  detail: 'Port 8081',
                },
                {
                  name: 'Search Engine',
                  detail: 'Lucene',
                },
                {
                  name: 'gRPC Ingestion',
                  detail: 'Port 9090',
                },
              ].map(
                (service) => (
                  <div
                    key={service.name}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-slate-800/40 px-3.5 py-3 transition hover:border-slate-700 hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]" />

                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {service.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                          {service.detail}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-emerald-400">
                      Online
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PERFORMANCE
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur transition hover:border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-cyan-500/10 p-2.5">
              <Clock3 className="h-5 w-5 text-cyan-400" />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              Performance
            </span>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Average Response Time
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {loading
              ? '...'
              : `${averageResponse.toFixed(
                  2
                )} ms`}
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{
                width: `${Math.min(
                  (averageResponse /
                    2000) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur transition hover:border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Server className="h-5 w-5 text-purple-400" />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              Infrastructure
            </span>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Active Services
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {loading
              ? '...'
              : activeServices}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            All indexed services responding
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur transition hover:border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-red-500/10 p-2.5">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              Reliability
            </span>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Error Rate
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {loading
              ? '...'
              : `${errorRate.toFixed(1)}%`}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-red-400 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    errorRate,
                    100
                  )}%`,
                }}
              />
            </div>

            <span className="text-[10px] text-slate-600">
              errors
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          RECENT LOGS
      ===================================================== */}

      {showRecentLogs && (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <Radio className="h-4 w-4 text-cyan-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">
                    Recent Logs
                  </h2>

                  <span className="rounded-md border border-cyan-500/10 bg-cyan-500/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                    Latest
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Latest indexed system activity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  animations
                    ? 'animate-pulse '
                    : ''
                }bg-emerald-400`}
              />

              Live index
            </div>
          </div>

          <div className="overflow-x-auto">
            {logsError && (
              <div className="px-5 py-10 text-center text-sm text-red-400">
                {logsError}
              </div>
            )}

            {!logsError &&
              logsLoading && (
                <div className="space-y-3 p-5">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className={`h-12 rounded-lg bg-slate-800/60 ${
                          animations
                            ? 'animate-pulse'
                            : ''
                        }`}
                      />
                    )
                  )}
                </div>
              )}

            {!logsError &&
              !logsLoading &&
              recentLogs.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Activity className="mx-auto h-8 w-8 text-slate-700" />

                  <p className="mt-3 text-sm text-slate-400">
                    No recent logs found.
                  </p>
                </div>
              )}

            {!logsError &&
              !logsLoading &&
              recentLogs.length > 0 && (
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/30 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                      <th className="px-5 py-3 font-semibold">
                        Time
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Level
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Service
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Message
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Host
                      </th>

                      <th className="px-5 py-3 text-right font-semibold">
                        Response
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60">
                    {recentLogs.map(
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
                            className="group transition-colors hover:bg-cyan-500/[0.025]"
                          >
                            <td className="whitespace-nowrap px-5 py-3.5">
                              <span className="font-mono text-xs text-slate-500">
                                {formatTime(
                                  log.timestamp
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${style.badge}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                />

                                {log.level}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5">
                              <span className="text-xs font-medium text-slate-300">
                                {log.service ||
                                  '-'}
                              </span>
                            </td>

                            <td className="max-w-lg px-5 py-3.5">
                              <div
                                className="truncate text-xs text-slate-400 transition group-hover:text-slate-200"
                                title={
                                  log.message
                                }
                              >
                                {log.message ||
                                  '-'}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5">
                              <span className="font-mono text-[11px] text-slate-600">
                                {log.host ||
                                  '-'}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-3.5 text-right">
                              <span
                                className={`font-mono text-[11px] font-medium ${getResponseColor(
                                  log.responseTimeMs
                                )}`}
                              >
                                {log.responseTimeMs !=
                                null
                                  ? `${log.responseTimeMs} ms`
                                  : '-'}
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

          {!logsLoading &&
            !logsError &&
            recentLogs.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/20 px-5 py-3">
                <span className="text-[10px] text-slate-600">
                  Showing{' '}
                  {recentLogs.length}{' '}
                  most recent events
                </span>

                <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Zap className="h-3 w-3 text-cyan-500" />
                  Indexed in Lucene
                </span>
              </div>
            )}
        </div>
      )}

      {/* =====================================================
          ERROR SUMMARY
      ===================================================== */}

      {!loading &&
        errorCount > 0 && (
          <div className="flex items-center gap-4 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">
                {errorCount} error
                {errorCount !== 1
                  ? 's'
                  : ''}{' '}
                detected
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Review Search Logs and
                Analytics for detailed
                information.
              </p>
            </div>
          </div>
        )}

      {/* =====================================================
          LEVEL LOG MODAL
      ===================================================== */}

      {selectedLevel && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={closeLevelLogs}
        >
          <div
            className={`absolute inset-0 bg-slate-950/75 backdrop-blur-md ${
              animations
                ? 'animate-[modalFadeIn_180ms_ease-out]'
                : ''
            }`}
          />

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className={`relative flex max-h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-[0_30px_100px_rgba(0,0,0,0.65)] ${
              animations
                ? 'animate-[modalSlideIn_220ms_cubic-bezier(.22,1,.36,1)]'
                : ''
            }`}
          >
            <div
              className={`absolute left-0 right-0 top-0 h-px ${
                selectedLevel === 'ERROR'
                  ? 'bg-red-400/70'
                  : selectedLevel ===
                      'WARN'
                    ? 'bg-amber-400/70'
                    : selectedLevel ===
                        'INFO'
                      ? 'bg-cyan-400/70'
                      : 'bg-slate-400/70'
              }`}
            />

            {/* MODAL HEADER */}

            <div className="shrink-0 border-b border-slate-800/80 bg-slate-900/80 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      selectedLevel ===
                      'ERROR'
                        ? 'bg-red-500/10'
                        : selectedLevel ===
                            'WARN'
                          ? 'bg-amber-500/10'
                          : selectedLevel ===
                              'INFO'
                            ? 'bg-cyan-500/10'
                            : 'bg-slate-500/10'
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${
                        selectedLevel ===
                        'ERROR'
                          ? 'bg-red-400'
                          : selectedLevel ===
                              'WARN'
                            ? 'bg-amber-400'
                            : selectedLevel ===
                                'INFO'
                              ? 'bg-cyan-400'
                              : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">
                        {selectedLevel}{' '}
                        Logs
                      </h2>

                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Filtered
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Showing indexed{' '}
                      {selectedLevel.toLowerCase()}{' '}
                      log events
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeLevelLogs
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-500 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />

                  <span className="text-xs text-slate-500">
                    Events
                  </span>

                  <span className="text-xs font-semibold text-white">
                    {levelLoading
                      ? '...'
                      : levelLogs.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Indexed in Lucene
                </div>
              </div>
            </div>

            {/* MODAL CONTENT */}

            <div className="min-h-0 flex-1 overflow-auto">
              {levelLoading && (
                <div className="space-y-2 p-5">
                  {[1, 2, 3, 4, 5].map(
                    (item) => (
                      <div
                        key={item}
                        className={`h-14 rounded-xl bg-slate-900 ${
                          animations
                            ? 'animate-pulse'
                            : ''
                        }`}
                      />
                    )
                  )}
                </div>
              )}

              {!levelLoading &&
                levelError && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center">
                    <div className="rounded-xl bg-red-500/10 p-3">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>

                    <p className="mt-4 text-sm text-red-400">
                      {levelError}
                    </p>
                  </div>
                )}

              {!levelLoading &&
                !levelError &&
                levelLogs.length === 0 && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center">
                    <Activity className="h-8 w-8 text-slate-700" />

                    <p className="mt-4 text-sm text-slate-400">
                      No {selectedLevel.toLowerCase()}{' '}
                      logs found.
                    </p>
                  </div>
                )}

              {!levelLoading &&
                !levelError &&
                levelLogs.length > 0 && (
                  <table className="w-full min-w-[1000px] text-left">
                    <thead className="sticky top-0 z-10 bg-slate-950">
                      <tr className="border-b border-slate-800 text-[10px] uppercase tracking-[0.15em] text-slate-600">
                        <th className="px-5 py-3">
                          Time
                        </th>

                        <th className="px-5 py-3">
                          Level
                        </th>

                        <th className="px-5 py-3">
                          Service
                        </th>

                        <th className="px-5 py-3">
                          Host
                        </th>

                        <th className="px-5 py-3">
                          Message
                        </th>

                        <th className="px-5 py-3 text-right">
                          Response
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/60">
                      {levelLogs.map(
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
                              className="transition-colors hover:bg-cyan-500/[0.025]"
                            >
                              <td className="whitespace-nowrap px-5 py-3.5">
                                <span className="font-mono text-xs text-slate-500">
                                  {formatTime(
                                    log.timestamp
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${style.badge}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                  />

                                  {log.level}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-300">
                                {log.service ||
                                  '-'}
                              </td>

                              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-600">
                                {log.host ||
                                  '-'}
                              </td>

                              <td className="max-w-xl px-5 py-3.5">
                                <div
                                  className="truncate text-xs text-slate-400"
                                  title={
                                    log.message
                                  }
                                >
                                  {log.message ||
                                    '-'}
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-5 py-3.5 text-right">
                                <span
                                  className={`font-mono text-[11px] font-medium ${getResponseColor(
                                    log.responseTimeMs
                                  )}`}
                                >
                                  {log.responseTimeMs !=
                                  null
                                    ? `${log.responseTimeMs} ms`
                                    : '-'}
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

            {/* MODAL FOOTER */}

            <div className="shrink-0 border-t border-slate-800/80 bg-slate-900/80 px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">
                  Showing{' '}
                  {levelLogs.length}{' '}
                  events
                </span>

                <button
                  type="button"
                  onClick={
                    closeLevelLogs
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
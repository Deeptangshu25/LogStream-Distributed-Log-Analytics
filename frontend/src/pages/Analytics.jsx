import { useEffect, useMemo, useState } from 'react'

import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock3,
  Server,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getAnalytics } from '../services/analyticsService'
import LogLevelPie3D from '../charts/LogLevelPie3D'

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /* ---------------------------------------------
     LOAD ANALYTICS
  --------------------------------------------- */

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')

        const data = await getAnalytics()

        setAnalytics(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load analytics data.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  /* ---------------------------------------------
     LOG LEVEL DATA
  --------------------------------------------- */

  const levelData = useMemo(() => {
    if (!analytics) {
      return []
    }

    return [
      {
        name: 'INFO',
        value: Number(analytics.infoCount) || 0,
      },
      {
        name: 'WARN',
        value: Number(analytics.warnCount) || 0,
      },
      {
        name: 'ERROR',
        value: Number(analytics.errorCount) || 0,
      },
      {
        name: 'DEBUG',
        value: Number(analytics.debugCount) || 0,
      },
    ]
  }, [analytics])

  /* ---------------------------------------------
     SERVICE DATA
  --------------------------------------------- */

  const serviceData = useMemo(() => {
    if (!analytics?.logsByService) {
      return []
    }

    return Object.entries(analytics.logsByService)
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [analytics])

  /* ---------------------------------------------
     TOTAL LOGS
  --------------------------------------------- */

  const totalLogs =
    Number(analytics?.totalLogs) || 0

  /* ---------------------------------------------
     ERROR RATE
  --------------------------------------------- */

  const errorRate =
    totalLogs > 0
      ? ((Number(analytics?.errorCount) || 0) /
          totalLogs) *
        100
      : 0

  /* ---------------------------------------------
     COLORS
  --------------------------------------------- */

  const levelColors = {
    INFO: '#06b6d4',
    WARN: '#f59e0b',
    ERROR: '#ef4444',
    DEBUG: '#64748b',
  }

  /* ---------------------------------------------
     SUMMARY CARDS
  --------------------------------------------- */

  const summaryCards = [
    {
      label: 'Total Logs',
      value: loading
        ? '...'
        : totalLogs.toLocaleString(),
      icon: Activity,
      iconClass: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      glow: 'from-cyan-500/10',
    },

    {
      label: 'Error Rate',
      value: loading
        ? '...'
        : `${errorRate.toFixed(1)}%`,
      icon: AlertCircle,
      iconClass: 'text-red-400',
      iconBg: 'bg-red-500/10',
      glow: 'from-red-500/10',
    },

    {
      label: 'Avg Response Time',
      value: loading
        ? '...'
        : `${Number(
            analytics?.averageResponseTimeMs || 0
          ).toFixed(2)} ms`,
      icon: Clock3,
      iconClass: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      glow: 'from-amber-500/10',
    },

    {
      label: 'Active Services',
      value: loading
        ? '...'
        : serviceData.length,
      icon: Server,
      iconClass: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      glow: 'from-purple-500/10',
    },
  ]

  return (
    <div className="space-y-7">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Observability
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-600" />

            <span className="text-xs text-slate-500">
              Analytics
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Analyze log patterns, service activity,
            and system performance.
          </p>
        </div>

        {/* Live indicator */}

        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>

          <span className="text-xs font-medium text-emerald-400">
            Live Data
          </span>
        </div>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >
              {/* Background glow */}

              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-50`}
              />

              <div className="relative">
                <div className="flex items-start justify-between">

                  {/* Icon */}

                  <div
                    className={`rounded-xl ${card.iconBg} p-3 ring-1 ring-inset ring-white/5`}
                  >
                    <Icon
                      className={`h-5 w-5 ${card.iconClass}`}
                    />
                  </div>

                  {/* Live */}

                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    Live
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  {card.label}
                </p>

                <p className="mt-1 truncate text-2xl font-bold tracking-tight text-white">
                  {card.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* =========================================
          MAIN CHARTS
      ========================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* =======================================
            3D PIE CHART
        ======================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur">

          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white">
                  Log Level Distribution
                </h2>

                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                  3D
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Click a slice to highlight the selected
                log level
              </p>
            </div>

            <div className="rounded-lg bg-cyan-500/10 p-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
            </div>
          </div>

          <div className="h-[430px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                  Loading analytics...
                </div>
              </div>
            ) : (
              <LogLevelPie3D
                infoCount={
                  analytics?.infoCount ?? 0
                }
                warnCount={
                  analytics?.warnCount ?? 0
                }
                errorCount={
                  analytics?.errorCount ?? 0
                }
                debugCount={
                  analytics?.debugCount ?? 0
                }
              />
            )}
          </div>
        </div>

        {/* =======================================
            LOGS BY SERVICE
        ======================================= */}

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur">

          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white">
                  Logs by Service
                </h2>

                <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                  SERVICES
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Log volume across services
              </p>
            </div>

            <div className="rounded-lg bg-purple-500/10 p-2">
              <Server className="h-4 w-4 text-purple-400" />
            </div>
          </div>

          <div className="h-[430px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />

                  Loading analytics...
                </div>
              </div>
            ) : serviceData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No service data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={serviceData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 25,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={115}
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: 'rgba(139, 92, 246, 0.05)',
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '10px',
                      color: '#fff',
                      boxShadow:
                        '0 10px 30px rgba(0,0,0,0.35)',
                    }}
                    labelStyle={{
                      color: '#cbd5e1',
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM ANALYTICS
      ========================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* =======================================
            SEVERITY SUMMARY
        ======================================= */}

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur">

          <div className="mb-6">
            <h2 className="font-semibold text-white">
              Severity Summary
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current distribution of indexed log levels
            </p>
          </div>

          <div className="space-y-5">
            {levelData.map((item) => {
              const percentage =
                totalLogs > 0
                  ? (item.value / totalLogs) * 100
                  : 0

              return (
                <div key={item.name}>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            levelColors[item.name],
                        }}
                      />

                      <span className="text-sm text-slate-400">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        {item.value}
                      </span>

                      <span className="w-12 text-right text-xs text-slate-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          levelColors[item.name],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* =======================================
            SERVICE SUMMARY
        ======================================= */}

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur">

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Service Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Indexed log volume per service
              </p>
            </div>

            <div className="rounded-lg bg-purple-500/10 p-2">
              <Server className="h-4 w-4 text-purple-400" />
            </div>
          </div>

          <div className="space-y-2">
            {serviceData.map((service, index) => (
              <div
                key={service.name}
                className="group flex items-center justify-between rounded-xl border border-transparent bg-slate-800/40 px-4 py-3 transition hover:border-slate-700 hover:bg-slate-800/70"
              >
                <div className="flex min-w-0 items-center gap-3">

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xs font-semibold text-purple-400">
                    {index + 1}
                  </span>

                  <span className="truncate text-sm text-slate-300">
                    {service.name}
                  </span>
                </div>

                <span className="ml-4 rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-semibold text-white">
                  {service.value}
                </span>
              </div>
            ))}

            {serviceData.length === 0 &&
              !loading && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No service data available.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
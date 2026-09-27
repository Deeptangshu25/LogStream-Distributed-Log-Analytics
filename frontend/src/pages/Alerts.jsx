import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  Server,
  TriangleAlert,
} from 'lucide-react'

import { getAlerts } from '../services/alertService'

const severityStyles = {
  critical: {
    badge: 'bg-red-500/10 text-red-400',
    icon: 'bg-red-500/10 text-red-400',
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-400',
    icon: 'bg-amber-500/10 text-amber-400',
  },
}

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true)
        setError('')

        const data = await getAlerts()
        setAlerts(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load alerts.')
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const errorAlerts = useMemo(
    () => alerts.filter((alert) => alert.alertType === 'ERROR'),
    [alerts]
  )

  const warningAlerts = useMemo(
    () => alerts.filter((alert) => alert.alertType === 'WARN'),
    [alerts]
  )

  const services = useMemo(() => {
    return new Set(
      alerts
        .map((alert) => alert.service)
        .filter(Boolean)
    ).size
  }, [alerts])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-red-500/10 p-2">
            <Bell className="h-6 w-6 text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Alerts
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Monitor errors and warnings detected in your logs.
            </p>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Total Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-red-500/10 p-3">
              <Bell className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Total Alerts
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {loading ? '...' : alerts.length}
              </p>
            </div>

          </div>

        </div>

        {/* Errors */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-red-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Critical Errors
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {loading ? '...' : errorAlerts.length}
              </p>
            </div>

          </div>

        </div>

        {/* Warnings */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-amber-500/10 p-3">
              <TriangleAlert className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Warnings
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {loading ? '...' : warningAlerts.length}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Alert Status */}
      {!loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <p className="font-medium text-white">
                  Alert monitoring is active
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Monitoring {alerts.length} alert
                  {alerts.length !== 1 ? 's' : ''} across {services}{' '}
                  service{services !== 1 ? 's' : ''}.
                </p>
              </div>

            </div>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Active
            </span>

          </div>

        </div>
      )}

      {/* Alerts List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

          <div>
            <h2 className="font-semibold text-white">
              Recent Alerts
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Errors and warnings from the log index
            </p>
          </div>

          <Bell className="h-5 w-5 text-cyan-400" />

        </div>

        <div className="divide-y divide-slate-800">

          {loading && (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              Loading alerts...
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="px-5 py-10 text-center">

              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />

              <p className="mt-3 font-medium text-white">
                No active alerts
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your log index currently contains no errors or warnings.
              </p>

            </div>
          )}

          {!loading &&
            alerts.map((alert, index) => {

              const style =
                severityStyles[alert.severity] ||
                severityStyles.warning

              const timestamp = alert.timestamp
                ? new Date(alert.timestamp)
                : null

              const time = timestamp
                ? timestamp.toLocaleString()
                : '-'

              return (
                <div
                  key={alert.id || index}
                  className="p-5 transition-colors hover:bg-slate-800/30"
                >

                  <div className="flex items-start gap-4">

                    {/* Alert Icon */}
                    <div
                      className={`rounded-lg p-2.5 ${style.icon}`}
                    >
                      {alert.alertType === 'ERROR' ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <TriangleAlert className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${style.badge}`}
                        >
                          {alert.alertType}
                        </span>

                        <span className="text-sm font-medium text-white">
                          {alert.service}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">

                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {time}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Server className="h-3.5 w-3.5" />
                          {alert.host || 'Unknown host'}
                        </span>

                        {alert.responseTimeMs !== undefined &&
                          alert.responseTimeMs !== null && (
                            <span>
                              Response: {alert.responseTimeMs} ms
                            </span>
                          )}

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

        </div>
      </div>

    </div>
  )
}

export default Alerts
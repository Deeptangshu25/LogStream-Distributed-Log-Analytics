import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Server,
  X,
  Zap,
} from 'lucide-react'

import { searchLogs } from '../services/searchService'

const initialFilters = {
  service: '',
  level: '',
  host: '',
  startTime: '',
  endTime: '',
}

const levelStyles = {
  ERROR: {
    badge: 'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
    glow: 'shadow-red-500/10',
  },

  WARN: {
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-500/10',
  },

  INFO: {
    badge: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    dot: 'bg-cyan-400',
    glow: 'shadow-cyan-500/10',
  },

  DEBUG: {
    badge: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
    dot: 'bg-slate-400',
    glow: 'shadow-slate-500/10',
  },
}

function getLevelStyle(level) {
  return levelStyles[level] || levelStyles.INFO
}

function formatDateTime(timestamp) {
  if (!timestamp) {
    return '-'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatTime(timestamp) {
  if (!timestamp) {
    return '-'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getResponseColor(value) {
  const response = Number(value) || 0

  if (response >= 1000) {
    return 'text-red-400'
  }

  if (response >= 500) {
    return 'text-amber-400'
  }

  return 'text-slate-500'
}

function getRelativeTime(timestamp) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 10) {
    return 'just now'
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  return `${days}d ago`
}

function toLocalDateTimeValue(date) {
  const pad = (value) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') +
    'T' +
    [
      pad(date.getHours()),
      pad(date.getMinutes()),
    ].join(':')
}

function SearchLogs() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  const [logs, setLogs] = useState([])
  const [totalHits, setTotalHits] = useState(0)

  const [page, setPage] = useState(0)
  const [size] = useState(20)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedLog, setSelectedLog] = useState(null)
  const [copied, setCopied] = useState(false)

  const [timePreset, setTimePreset] = useState('')

  /*
   * ============================================================
   * LOAD LOGS
   * ============================================================
   */

  async function loadLogs(targetPage = page, overrideFilters = filters) {
    try {
      setLoading(true)
      setError('')

      const result = await searchLogs({
        query,
        ...overrideFilters,
        page: targetPage,
        size,
      })

      const returnedLogs = result.logs || []

      setLogs(returnedLogs)
      setTotalHits(result.totalHits || 0)
      setPage(result.page ?? targetPage)
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load logs. Make sure the Spring Boot backend is running on port 8081.',
      )

      setLogs([])
      setTotalHits(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(0)
  }, [])

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSearch(event) {
    event.preventDefault()
    setTimePreset('')
    loadLogs(0)
  }

  function clearSearch() {
    const clearedFilters = { ...initialFilters }

    setQuery('')
    setFilters(clearedFilters)
    setTimePreset('')

    setTimeout(() => {
      loadLogs(0, clearedFilters)
    }, 0)
  }

  function clearFilter(name) {
    const updatedFilters = {
      ...filters,
      [name]: '',
    }

    setFilters(updatedFilters)

    if (name === 'startTime' || name === 'endTime') {
      setTimePreset('')
    }

    setTimeout(() => {
      loadLogs(0, updatedFilters)
    }, 0)
  }

  /*
   * ============================================================
   * QUICK TIME FILTERS
   * ============================================================
   */

  function applyTimePreset(minutes, label) {
    const now = new Date()
    const start = new Date(now.getTime() - minutes * 60 * 1000)

    const updatedFilters = {
      ...filters,
      startTime: toLocalDateTimeValue(start),
      endTime: toLocalDateTimeValue(now),
    }

    setFilters(updatedFilters)
    setTimePreset(label)

    setTimeout(() => {
      loadLogs(0, updatedFilters)
    }, 0)
  }

  function clearTimePreset() {
    const updatedFilters = {
      ...filters,
      startTime: '',
      endTime: '',
    }

    setFilters(updatedFilters)
    setTimePreset('')

    setTimeout(() => {
      loadLogs(0, updatedFilters)
    }, 0)
  }

  /*
   * ============================================================
   * SERVICES
   * ============================================================
   */

  const services = useMemo(() => {
    const values = logs
      .map((log) => log.service)
      .filter(Boolean)

    return [...new Set(values)].sort()
  }, [logs])

  /*
   * ============================================================
   * ACTIVE FILTERS
   * ============================================================
   */

  const activeFilters = useMemo(() => {
    const result = []

    if (query.trim()) {
      result.push({
        key: 'query',
        label: `Query: ${query}`,
      })
    }

    if (filters.service) {
      result.push({
        key: 'service',
        label: `Service: ${filters.service}`,
      })
    }

    if (filters.level) {
      result.push({
        key: 'level',
        label: `Level: ${filters.level}`,
      })
    }

    if (filters.host) {
      result.push({
        key: 'host',
        label: `Host: ${filters.host}`,
      })
    }

    if (filters.startTime) {
      result.push({
        key: 'startTime',
        label: `From: ${filters.startTime.replace('T', ' ')}`,
      })
    }

    if (filters.endTime) {
      result.push({
        key: 'endTime',
        label: `To: ${filters.endTime.replace('T', ' ')}`,
      })
    }

    return result
  }, [query, filters])

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages = Math.ceil(totalHits / size)

  const firstResult =
    totalHits === 0 ? 0 : page * size + 1

  const lastResult =
    Math.min((page + 1) * size, totalHits)

  /*
   * ============================================================
   * LOG DETAILS
   * ============================================================
   */

  function openLogDetails(log) {
    setSelectedLog(log)
    setCopied(false)
  }

  function closeLogDetails() {
    setSelectedLog(null)
    setCopied(false)
  }

  async function copyLogJson() {
    if (!selectedLog) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(selectedLog, null, 2),
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch (err) {
      console.error('Unable to copy log:', err)
    }
  }

  /*
   * ============================================================
   * ESC KEY
   * ============================================================
   */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogDetails()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [])

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-5">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/[0.04] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                Log Search

              </span>

              <span className="text-[10px] text-slate-700">
                •
              </span>

              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Indexed observability data
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Search Logs
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Search and filter indexed application activity.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">

              <div className="flex items-center gap-2">

                <Activity className="h-4 w-4 text-cyan-400" />

                <span className="text-xs text-slate-500">
                  Indexed logs
                </span>

              </div>

              <p className="mt-1 text-xl font-bold text-white">
                {totalHits.toLocaleString()}
              </p>

            </div>

            <button
              type="button"
              onClick={() => loadLogs(0)}
              disabled={loading}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 transition hover:border-cyan-500/30 hover:bg-slate-900 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              title="Refresh logs"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? 'animate-spin' : ''
                }`}
              />
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          SEARCH / FILTER PANEL
      ====================================================== */}

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-xl shadow-black/10"
      >

        <div className="flex flex-col gap-3 xl:flex-row">

          <div className="relative flex-1">

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search messages, services, trace IDs..."
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/5"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </span>
          </button>

        </div>

        {/* Filters */}

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

          <div className="relative">

            <Server className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <select
              value={filters.service}
              onChange={(event) =>
                updateFilter(
                  'service',
                  event.target.value,
                )
              }
              className="h-10 w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-8 text-sm text-slate-400 outline-none transition focus:border-cyan-500/40"
            >
              <option value="">
                All Services
              </option>

              {services.map((service) => (
                <option
                  key={service}
                  value={service}
                >
                  {service}
                </option>
              ))}
            </select>

          </div>

          <select
            value={filters.level}
            onChange={(event) =>
              updateFilter(
                'level',
                event.target.value,
              )
            }
            className="h-10 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-400 outline-none transition focus:border-cyan-500/40"
          >
            <option value="">All Levels</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>

          <input
            value={filters.host}
            onChange={(event) =>
              updateFilter(
                'host',
                event.target.value,
              )
            }
            placeholder="Filter by host"
            className="h-10 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-400 outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40"
          />

          <div className="flex gap-2">

            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(event) => {
                setTimePreset('')

                updateFilter(
                  'startTime',
                  event.target.value,
                )
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-500 outline-none transition focus:border-cyan-500/40"
            />

            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(event) => {
                setTimePreset('')

                updateFilter(
                  'endTime',
                  event.target.value,
                )
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-500 outline-none transition focus:border-cyan-500/40"
            />

          </div>

        </div>

        {/* Quick time filters */}

        <div className="mt-4 flex flex-wrap items-center gap-2">

          <div className="mr-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">

            <CalendarClock className="h-3.5 w-3.5" />

            Quick range

          </div>

          {[
            ['15m', 15],
            ['1h', 60],
            ['6h', 360],
            ['24h', 1440],
          ].map(([label, minutes]) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                applyTimePreset(minutes, label)
              }
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
                timePreset === label
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              Last {label}
            </button>
          ))}

          {timePreset && (
            <button
              type="button"
              onClick={clearTimePreset}
              className="rounded-lg px-2 py-1.5 text-[11px] text-slate-600 transition hover:text-slate-300"
            >
              Clear range
            </button>
          )}

        </div>

      </form>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">

          <div className="h-2 w-2 rounded-full bg-red-400" />

          {error}

        </div>
      )}

      {/* ======================================================
          RESULT SUMMARY
      ====================================================== */}

      <div className="flex flex-col gap-3">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-sm text-slate-400">

              <Filter className="h-4 w-4 text-cyan-500" />

              <span>
                <strong className="font-semibold text-slate-200">
                  {totalHits.toLocaleString()}
                </strong>{' '}
                logs found
              </span>

            </div>

            {loading && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-500">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                Searching

              </span>
            )}

          </div>

          {totalHits > 0 && (
            <span className="text-xs text-slate-600">
              Showing {firstResult}–{lastResult}
            </span>
          )}

        </div>

        {/* Active filters */}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">

            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  if (filter.key === 'query') {
                    setQuery('')
                    return
                  }

                  clearFilter(filter.key)
                }}
                className="group flex items-center gap-1.5 rounded-full border border-cyan-500/15 bg-cyan-500/5 px-2.5 py-1 text-[10px] text-cyan-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10"
              >
                {filter.label}

                <X className="h-3 w-3 opacity-60 transition group-hover:opacity-100" />
              </button>
            ))}

            <button
              type="button"
              onClick={clearSearch}
              className="px-2 py-1 text-[10px] text-slate-600 transition hover:text-slate-300"
            >
              Clear all
            </button>

          </div>
        )}

      </div>

      {/* ======================================================
          LOG TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/10">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] text-left">

            <thead>

              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] uppercase tracking-[0.16em] text-slate-600">

                <th className="px-5 py-3.5 font-semibold">
                  Timestamp
                </th>

                <th className="px-4 py-3.5 font-semibold">
                  Level
                </th>

                <th className="px-4 py-3.5 font-semibold">
                  Service
                </th>

                <th className="px-4 py-3.5 font-semibold">
                  Host
                </th>

                <th className="px-4 py-3.5 font-semibold">
                  Message
                </th>

                <th className="px-5 py-3.5 text-right font-semibold">
                  Response
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800/60">

              {loading ? (
                Array.from({ length: 7 }).map(
                  (_, index) => (
                    <tr key={index}>

                      <td
                        colSpan={6}
                        className="px-5 py-4"
                      >

                        <div className="h-5 animate-pulse rounded bg-slate-800/50" />

                      </td>

                    </tr>
                  ),
                )
              ) : logs.length === 0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-16"
                  >

                    <div className="flex flex-col items-center justify-center text-center">

                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">

                        <Search className="h-5 w-5 text-slate-700" />

                      </div>

                      <p className="text-sm font-medium text-slate-400">
                        No logs found
                      </p>

                      <p className="mt-1 max-w-sm text-xs text-slate-600">
                        Try changing your search query or
                        removing one of the active filters.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                logs.map((log, index) => {

                  const style = getLevelStyle(log.level)

                  return (
                    <tr
                      key={
                        log.id ||
                        `${log.timestamp}-${index}`
                      }
                      onClick={() =>
                        openLogDetails(log)
                      }
                      className="group cursor-pointer transition-colors hover:bg-cyan-500/[0.035]"
                    >

                      {/* Timestamp */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <Clock3 className="h-3.5 w-3.5 text-slate-700 transition group-hover:text-cyan-500/60" />

                          <div>

                            <p className="font-mono text-[11px] text-slate-400">
                              {formatTime(
                                log.timestamp,
                              )}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-700">
                              {getRelativeTime(
                                log.timestamp,
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Level */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${style.badge}`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />

                          {log.level}

                        </span>

                      </td>

                      {/* Service */}

                      <td className="whitespace-nowrap px-4 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-slate-600">

                            <Server className="h-3.5 w-3.5" />

                          </div>

                          <span className="text-xs font-medium text-slate-300">
                            {log.service || '-'}
                          </span>

                        </div>

                      </td>

                      {/* Host */}

                      <td className="whitespace-nowrap px-4 py-4">

                        <span className="font-mono text-[11px] text-slate-600">
                          {log.host || '-'}
                        </span>

                      </td>

                      {/* Message */}

                      <td className="max-w-[560px] px-4 py-4">

                        <div className="flex items-center gap-2">

                          <span
                            className="block truncate text-xs text-slate-400 transition group-hover:text-slate-200"
                            title={log.message}
                          >
                            {log.message || '-'}
                          </span>

                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-800 opacity-0 transition group-hover:text-cyan-500/60 group-hover:opacity-100" />

                        </div>

                      </td>

                      {/* Response */}

                      <td className="whitespace-nowrap px-5 py-4 text-right">

                        <span
                          className={`font-mono text-[11px] font-medium ${getResponseColor(
                            log.responseTimeMs,
                          )}`}
                        >
                          {log.responseTimeMs != null
                            ? `${log.responseTimeMs} ms`
                            : '-'}
                        </span>

                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>

          </table>

        </div>

        {/* Table footer */}

        <div className="flex flex-col gap-3 border-t border-slate-800/80 bg-slate-950/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-[10px] text-slate-600">

            <Zap className="h-3 w-3 text-cyan-500" />

            Indexed with Lucene

          </div>

          {totalHits > 0 && (
            <span className="text-[10px] text-slate-600">
              Page {page + 1} of {totalPages}
            </span>
          )}

        </div>

      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3">

          <span className="text-xs text-slate-600">
            Page {page + 1} of {totalPages}
          </span>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={
                page === 0 ||
                loading
              }
              onClick={() =>
                loadLogs(page - 1)
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages - 1 ||
                loading
              }
              onClick={() =>
                loadLogs(page + 1)
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

          </div>

        </div>
      )}

      {/* ======================================================
          LOG DETAILS DRAWER
      ====================================================== */}

      {selectedLog && (
        <>

          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeLogDetails}
          />

          <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black/50">

            {/* Drawer header */}

            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5">

                    <Activity className="h-4 w-4 text-cyan-400" />

                  </div>

                  <div>

                    <h2 className="text-sm font-semibold text-white">
                      Log Details
                    </h2>

                    <p className="text-[10px] text-slate-600">
                      Indexed event
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeLogDetails}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* Drawer body */}

            <div className="flex-1 overflow-y-auto p-6">

              {/* Level */}

              <div className="mb-6 flex items-center justify-between">

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Severity
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    getLevelStyle(
                      selectedLog.level,
                    ).badge
                  }`}
                >

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      getLevelStyle(
                        selectedLog.level,
                      ).dot
                    }`}
                  />

                  {selectedLog.level}

                </span>

              </div>

              {/* Message */}

              <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Message
                  </span>

                  <button
                    type="button"
                    onClick={copyLogJson}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-slate-600 transition hover:bg-slate-800 hover:text-cyan-400"
                  >

                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy JSON
                      </>
                    )}

                  </button>

                </div>

                <p className="break-words text-sm leading-6 text-slate-300">
                  {selectedLog.message || '-'}
                </p>

              </div>

              {/* Metadata */}

              <div className="space-y-1">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Event Metadata
                </p>

                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800">

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Timestamp
                    </span>

                    <span className="text-right font-mono text-xs text-slate-300">
                      {formatDateTime(
                        selectedLog.timestamp,
                      )}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Service
                    </span>

                    <span className="text-right text-xs font-medium text-slate-300">
                      {selectedLog.service || '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Host
                    </span>

                    <span className="text-right font-mono text-xs text-slate-400">
                      {selectedLog.host || '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Response Time
                    </span>

                    <span
                      className={`text-right font-mono text-xs font-medium ${getResponseColor(
                        selectedLog.responseTimeMs,
                      )}`}
                    >
                      {selectedLog.responseTimeMs != null
                        ? `${selectedLog.responseTimeMs} ms`
                        : '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Log ID
                    </span>

                    <span className="break-all text-right font-mono text-[10px] text-slate-500">
                      {selectedLog.id || '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-2 bg-slate-950/90 px-4 py-3">

                    <span className="text-xs text-slate-600">
                      Trace ID
                    </span>

                    <span className="break-all text-right font-mono text-[10px] text-cyan-500/70">
                      {selectedLog.traceId || '-'}
                    </span>

                  </div>

                </div>

              </div>

              {/* Raw JSON */}

              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Raw Event
                  </span>

                  <span className="text-[9px] text-slate-700">
                    JSON
                  </span>

                </div>

                <pre className="max-h-72 overflow-auto rounded-xl border border-slate-800 bg-black/20 p-4 font-mono text-[10px] leading-5 text-slate-500">
                  {JSON.stringify(
                    selectedLog,
                    null,
                    2,
                  )}
                </pre>

              </div>

            </div>

            {/* Drawer footer */}

            <div className="border-t border-slate-800 bg-slate-950 px-6 py-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 text-[10px] text-slate-600">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  Indexed in LogStream

                </div>

                <button
                  type="button"
                  onClick={closeLogDetails}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                  Close
                </button>

              </div>

            </div>

          </aside>

        </>
      )}

    </div>
  )
}

export default SearchLogs
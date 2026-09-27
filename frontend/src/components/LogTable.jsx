const levelStyles = {
  ERROR: 'bg-red-500/10 text-red-400',
  WARN: 'bg-amber-500/10 text-amber-400',
  INFO: 'bg-cyan-500/10 text-cyan-400',
  DEBUG: 'bg-slate-500/10 text-slate-400',
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '-'

  return new Date(timestamp).toLocaleString()
}

function LogTable({ logs = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
          Searching logs...
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            No logs found
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Try changing your search or filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Level</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Host</th>
              <th className="px-5 py-3 font-medium">Message</th>
              <th className="px-5 py-3 font-medium">Response</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
              >
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">
                  {formatTimestamp(log.timestamp)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                      levelStyles[log.level] ||
                      levelStyles.INFO
                    }`}
                  >
                    {log.level}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                  {log.service}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                  {log.host}
                </td>

                <td className="min-w-80 px-5 py-4 text-sm text-slate-400">
                  {log.message}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                  {log.responseTimeMs ?? '-'} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LogTable

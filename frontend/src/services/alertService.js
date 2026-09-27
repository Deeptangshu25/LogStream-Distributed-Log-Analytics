import { searchLogs } from './searchService'

export async function getAlerts() {
  const [errors, warnings] = await Promise.all([
    searchLogs({
      level: 'ERROR',
      page: 0,
      size: 100,
    }),
    searchLogs({
      level: 'WARN',
      page: 0,
      size: 100,
    }),
  ])

  const errorAlerts = (errors.logs || []).map((log) => ({
    ...log,
    alertType: 'ERROR',
    severity: 'critical',
  }))

  const warningAlerts = (warnings.logs || []).map((log) => ({
    ...log,
    alertType: 'WARN',
    severity: 'warning',
  }))

  return [...errorAlerts, ...warningAlerts].sort(
    (a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
  )
}

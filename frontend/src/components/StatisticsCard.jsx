import {
  Activity,
  AlertCircle,
  Server,
  TriangleAlert,
} from 'lucide-react'

const iconMap = {
  logs: Activity,
  errors: AlertCircle,
  warnings: TriangleAlert,
  services: Server,
}

function StatisticsCard({
  title,
  value,
  change,
  description,
  type = 'logs',
}) {
  const Icon = iconMap[type] || Activity

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
          <Icon className="h-5 w-5 text-cyan-400" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-semibold text-emerald-400">
          {change}
        </span>

        <span className="text-xs text-slate-500">
          {description}
        </span>
      </div>
    </div>
  )
}

export default StatisticsCard

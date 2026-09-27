import { useMemo } from 'react'

import { Chart } from '@highcharts/react'
import { PieSeries } from '@highcharts/react/series/Pie'

import 'highcharts/es-modules/masters/highcharts-3d.src.js'

function LogLevelPie3D({
  infoCount = 0,
  warnCount = 0,
  errorCount = 0,
  debugCount = 0,
}) {
  const chartData = useMemo(
    () => [
      {
        name: 'INFO',
        y: Number(infoCount) || 0,
        color: '#06b6d4',
      },
      {
        name: 'WARN',
        y: Number(warnCount) || 0,
        color: '#f59e0b',
      },
      {
        name: 'ERROR',
        y: Number(errorCount) || 0,
        color: '#ef4444',
      },
      {
        name: 'DEBUG',
        y: Number(debugCount) || 0,
        color: '#64748b',
      },
    ],
    [
      infoCount,
      warnCount,
      errorCount,
      debugCount,
    ]
  )

  const visibleData = useMemo(
    () => chartData.filter((item) => item.y > 0),
    [chartData]
  )

  const total = useMemo(
    () =>
      chartData.reduce(
        (sum, item) => sum + item.y,
        0
      ),
    [chartData]
  )

  if (total === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          </div>

          <p className="text-sm font-medium text-slate-400">
            No log data available
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Waiting for indexed logs
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <Chart
        containerProps={{
          style: {
            width: '100%',
            height: '100%',
          },
        }}
        options={{
          chart: {
            type: 'pie',
            backgroundColor: 'transparent',

            height: 390,

            spacing: [5, 5, 5, 5],

            options3d: {
              enabled: true,
              alpha: 55,
              beta: 0,
              depth: 55,
              viewDistance: 25,
            },
          },

          title: {
            text: undefined,
          },

          credits: {
            enabled: false,
          },

          accessibility: {
            enabled: false,
          },

          tooltip: {
            backgroundColor:
              'rgba(15, 23, 42, 0.98)',

            borderColor: '#334155',

            borderWidth: 1,

            borderRadius: 10,

            shadow: false,

            style: {
              color: '#e2e8f0',
              fontSize: '12px',
            },

            pointFormat:
              '<span style="color:{point.color}">●</span> ' +
              '<span style="color:#cbd5e1">{point.name}</span>' +
              ': <b style="color:#ffffff">{point.y}</b> logs<br/>' +
              '<span style="color:#64748b">Percentage</span>' +
              ': <b style="color:#ffffff">{point.percentage:.1f}%</b>',
          },

          legend: {
            enabled: true,

            align: 'right',

            verticalAlign: 'middle',

            layout: 'vertical',

            padding: 5,

            itemMarginTop: 5,

            itemMarginBottom: 10,

            symbolHeight: 10,

            symbolWidth: 10,

            symbolRadius: 5,

            itemStyle: {
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: '500',
            },

            itemHoverStyle: {
              color: '#ffffff',
            },
          },

          plotOptions: {
            pie: {
              depth: 55,

              size: '76%',

              center: ['42%', '50%'],

              startAngle: -25,

              allowPointSelect: true,

              slicedOffset: 18,

              cursor: 'pointer',

              showInLegend: true,

              borderWidth: 1,

              borderColor: '#020617',

              animation: {
                duration: 500,
              },

              dataLabels: {
                enabled: true,

                distance: 18,

                allowOverlap: false,

                style: {
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  textOutline: 'none',
                },

                formatter: function () {
                  return `${this.point.name}: ${this.point.y}`
                },
              },

              states: {
                hover: {
                  brightness: 0.12,

                  halo: {
                    size: 8,
                    opacity: 0.25,
                  },
                },

                inactive: {
                  opacity: 0.35,
                },
              },
            },
          },
        }}
      >
        <PieSeries
          name="Logs"
          data={visibleData}
        />
      </Chart>

      {/* Total */}
      <div className="pointer-events-none absolute bottom-1 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/90 px-4 py-2 shadow-xl backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total
          </span>

          <span className="text-sm font-bold text-white">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LogLevelPie3D
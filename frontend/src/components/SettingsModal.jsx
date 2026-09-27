import { useEffect, useState } from 'react'

import {
  Activity,
  BarChart3,
  Check,
  RotateCcw,
  Settings,
  X,
  Zap,
} from 'lucide-react'

const DEFAULT_SETTINGS = {
  animations: true,
  websocket: true,
  autoRefresh: true,
  recentLogs: true,
  compactMode: false,
}

function SettingsModal({ open, onClose }) {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS)

  /*
   * Load saved settings
   */

  useEffect(() => {
    if (!open) return

    try {
      const saved =
        localStorage.getItem(
          'logstream-settings'
        )

      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        })
      }
    } catch (error) {
      console.error(
        'Unable to load settings',
        error
      )
    }
  }, [open])

  /*
   * Save settings
   */

  useEffect(() => {
    if (!open) return

    localStorage.setItem(
      'logstream-settings',
      JSON.stringify(settings)
    )

    /*
     * Let other components know
     * that settings changed.
     */

    window.dispatchEvent(
      new CustomEvent(
        'logstream-settings-changed',
        {
          detail: settings,
        }
      )
    )
  }, [settings, open])

  /*
   * ESC to close
   */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
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
  }, [open, onClose])

  if (!open) {
    return null
  }

  /*
   * Toggle
   */

  function toggleSetting(key) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  /*
   * Reset
   */

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS)

    localStorage.setItem(
      'logstream-settings',
      JSON.stringify(DEFAULT_SETTINGS)
    )

    window.dispatchEvent(
      new CustomEvent(
        'logstream-settings-changed',
        {
          detail: DEFAULT_SETTINGS,
        }
      )
    )
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* =========================================
          BACKDROP
      ========================================= */}

      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md animate-[modalFadeIn_180ms_ease-out]" />

      {/* =========================================
          MODAL
      ========================================= */}

      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-[0_30px_100px_rgba(0,0,0,0.7)] animate-[settingsSlideIn_220ms_cubic-bezier(.22,1,.36,1)]"
      >

        {/* Top glow */}

        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Ambient glow */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl" />

        <div className="relative">

          {/* =====================================
              HEADER
          ===================================== */}

          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">

                <Settings className="h-5 w-5 text-cyan-400" />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Settings
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Configure your LogStream workspace
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-500 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

          </div>

          {/* =====================================
              CONTENT
          ===================================== */}

          <div className="max-h-[65vh] overflow-y-auto p-6">

            {/* ===================================
                APPEARANCE
            =================================== */}

            <section>

              <div className="mb-3 flex items-center gap-2">

                <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Dashboard
                </span>

              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">

                {/* Animated charts */}

                <SettingRow
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                  title="Animated Charts"
                  description="Enable smooth chart transitions and effects"
                  enabled={settings.animations}
                  onToggle={() =>
                    toggleSetting(
                      'animations'
                    )
                  }
                />

                {/* Recent logs */}

                <SettingRow
                  icon={
                    <BarChart3 className="h-4 w-4" />
                  }
                  title="Recent Logs"
                  description="Show recent log activity on the dashboard"
                  enabled={settings.recentLogs}
                  onToggle={() =>
                    toggleSetting(
                      'recentLogs'
                    )
                  }
                />

                {/* Compact mode */}

                <SettingRow
                  icon={
                    <Zap className="h-4 w-4" />
                  }
                  title="Compact Mode"
                  description="Reduce spacing for a denser dashboard"
                  enabled={settings.compactMode}
                  onToggle={() =>
                    toggleSetting(
                      'compactMode'
                    )
                  }
                  last
                />

              </div>

            </section>

            {/* ===================================
                LIVE MONITORING
            =================================== */}

            <section className="mt-7">

              <div className="mb-3 flex items-center gap-2">

                <Activity className="h-3.5 w-3.5 text-emerald-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Live Monitoring
                </span>

              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">

                {/* WebSocket */}

                <SettingRow
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                  title="Live WebSocket"
                  description="Receive incoming logs in real time"
                  enabled={settings.websocket}
                  onToggle={() =>
                    toggleSetting(
                      'websocket'
                    )
                  }
                />

                {/* Auto refresh */}

                <SettingRow
                  icon={
                    <RotateCcw className="h-4 w-4" />
                  }
                  title="Auto Refresh"
                  description="Automatically refresh dashboard statistics"
                  enabled={settings.autoRefresh}
                  onToggle={() =>
                    toggleSetting(
                      'autoRefresh'
                    )
                  }
                  last
                />

              </div>

            </section>

            {/* ===================================
                STATUS
            =================================== */}

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] px-4 py-3">

              <div className="relative flex h-2.5 w-2.5">

                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />

              </div>

              <div className="flex-1">

                <p className="text-xs font-medium text-emerald-400">
                  Configuration saved
                </p>

                <p className="mt-0.5 text-[10px] text-slate-600">
                  Your preferences are stored locally.
                </p>

              </div>

              <Check className="h-4 w-4 text-emerald-400" />

            </div>

          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/50 px-6 py-4">

            <button
              type="button"
              onClick={resetSettings}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-400"
            >
              Done
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}


/*
 * =========================================================
 * SETTING ROW
 * =========================================================
 */

function SettingRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-4
        px-4
        py-4
        transition
        hover:bg-slate-800/40
        ${
          !last
            ? 'border-b border-slate-800/70'
            : ''
        }
      `}
    >

      {/* Icon */}

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition
          ${
            enabled
              ? 'bg-cyan-500/10 text-cyan-400'
              : 'bg-slate-800 text-slate-600'
          }
        `}
      >
        {icon}
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">

        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] leading-5 text-slate-600">
          {description}
        </p>

      </div>

      {/* Toggle */}

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-all
          duration-200
          ${
            enabled
              ? 'bg-cyan-500'
              : 'bg-slate-700'
          }
        `}
      >

        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-md
            transition-all
            duration-200
            ${
              enabled
                ? 'left-6'
                : 'left-1'
            }
          `}
        />

      </button>

    </div>
  )
}

export default SettingsModal
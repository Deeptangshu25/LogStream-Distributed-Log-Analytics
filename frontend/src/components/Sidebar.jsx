import {
  LayoutDashboard,
  Activity,
  Search,
  BarChart3,
  Bell,
  Settings,
  TerminalSquare,
  ChevronLeft,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navigation = [
  {
    name: 'Dashboard',
    description: 'System overview',
    path: '/',
    icon: LayoutDashboard,
  },

  {
    name: 'Live Tail',
    description: 'Real-time logs',
    path: '/live',
    icon: Activity,
  },

  {
    name: 'Search Logs',
    description: 'Find log entries',
    path: '/search',
    icon: Search,
  },

  {
    name: 'Analytics',
    description: 'Log insights',
    path: '/analytics',
    icon: BarChart3,
  },

  {
    name: 'Alerts',
    description: 'Errors & warnings',
    path: '/alerts',
    icon: Bell,
  },
]

function Sidebar({
  collapsed = false,
  setCollapsed = () => {},
  onSettings = () => {},
}) {
  const toggleSidebar = () => {
    setCollapsed((prev) => !prev)
  }

  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        flex-col
        overflow-hidden
        border-r
        border-slate-800/80
        bg-slate-950/95
        backdrop-blur-xl
        transition-[width]
        duration-300
        ease-in-out
        ${
          collapsed
            ? 'w-[76px]'
            : 'w-64'
        }
      `}
    >

      {/* =========================================
          BRAND / TOGGLE
      ========================================= */}

      <div
        className={`
          relative
          flex
          h-[92px]
          shrink-0
          items-center
          border-b
          border-slate-800/80
          ${
            collapsed
              ? 'justify-center px-2'
              : 'px-5'
          }
        `}
      >

        {/* Ambient glow */}

        <div
          className="
            pointer-events-none
            absolute
            -left-10
            top-0
            h-24
            w-24
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        {/* LOGO BUTTON */}

        <button
          type="button"
          onClick={toggleSidebar}
          title={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
          aria-label={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
          className="
            group
            relative
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-cyan-500/20
            bg-cyan-500/[0.07]
            transition-all
            duration-200
            hover:border-cyan-400/40
            hover:bg-cyan-500/15
            hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]
            active:scale-95
          "
        >

          {/* Online dot */}

          <span
            className="
              absolute
              right-[-2px]
              top-[-2px]
              h-2.5
              w-2.5
              rounded-full
              bg-emerald-400
              shadow-[0_0_10px_rgba(52,211,153,0.8)]
            "
          />

          <TerminalSquare
            className="
              h-6
              w-6
              text-cyan-400
              transition-transform
              duration-300
              group-hover:scale-110
            "
          />

        </button>

        {/* BRAND TEXT */}

        <div
          className={`
            ml-3
            min-w-0
            whitespace-nowrap
            transition-all
            duration-200
            ${
              collapsed
                ? 'w-0 translate-x-[-10px] opacity-0'
                : 'w-auto translate-x-0 opacity-100'
            }
          `}
        >

          <h1 className="text-lg font-bold tracking-tight text-white">
            Log<span className="text-cyan-400">Stream</span>
          </h1>

          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-slate-500">
            Observability
          </p>

        </div>

        {/* Collapse arrow */}

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="
              absolute
              right-3
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-slate-800
              hover:text-slate-300
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

      </div>

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav
        className={`
          flex-1
          space-y-2
          overflow-y-auto
          overflow-x-hidden
          py-6
          ${
            collapsed
              ? 'px-2'
              : 'px-3'
          }
        `}
      >

        {/* Workspace label */}

        <div
          className={`
            mb-4
            overflow-hidden
            whitespace-nowrap
            px-3
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-slate-600
            transition-all
            duration-200
            ${
              collapsed
                ? 'h-0 opacity-0'
                : 'h-4 opacity-100'
            }
          `}
        >
          Workspace
        </div>

        {navigation.map((item) => {

          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={
                collapsed
                  ? item.name
                  : undefined
              }
              className={({ isActive }) => `
                group
                relative
                flex
                w-full
                items-center
                rounded-xl
                transition-all
                duration-200
                ${
                  collapsed
                    ? 'justify-center px-2 py-3'
                    : 'gap-3 px-3 py-3'
                }
                ${
                  isActive
                    ? 'bg-cyan-500/[0.10] text-white'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                }
              `}
            >

              {({ isActive }) => (
                <>

                  {/* Active indicator */}

                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-7
                        w-[3px]
                        -translate-y-1/2
                        rounded-r-full
                        bg-cyan-400
                        shadow-[0_0_12px_rgba(34,211,238,0.8)]
                      "
                    />
                  )}

                  {/* Icon */}

                  <div
                    className={`
                      flex
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition-all
                      duration-200
                      ${
                        collapsed
                          ? 'h-11 w-11'
                          : 'h-10 w-10'
                      }
                      ${
                        isActive
                          ? 'bg-cyan-500/10'
                          : 'bg-slate-900/70 group-hover:bg-slate-800'
                      }
                    `}
                  >

                    <Icon
                      className={`
                        transition
                        duration-200
                        ${
                          collapsed
                            ? 'h-5 w-5'
                            : 'h-[18px] w-[18px]'
                        }
                        ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-500 group-hover:text-cyan-400'
                        }
                      `}
                    />

                  </div>

                  {/* Text */}

                  <div
                    className={`
                      min-w-0
                      flex-1
                      overflow-hidden
                      whitespace-nowrap
                      transition-all
                      duration-200
                      ${
                        collapsed
                          ? 'w-0 opacity-0'
                          : 'w-auto opacity-100'
                      }
                    `}
                  >

                    <p
                      className={`
                        text-sm
                        font-semibold
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-300'
                        }
                      `}
                    >
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-600">
                      {item.description}
                    </p>

                  </div>

                  {/* Active arrow */}

                  {!collapsed && isActive && (
                    <span className="text-cyan-400">
                      ›
                    </span>
                  )}

                </>
              )}

            </NavLink>
          )
        })}

      </nav>

      {/* =========================================
          BOTTOM SECTION
      ========================================= */}

      <div
        className={`
          shrink-0
          border-t
          border-slate-800/80
          ${
            collapsed
              ? 'p-2'
              : 'p-3'
          }
        `}
      >

        {/* SETTINGS */}

        <button
          type="button"
          onClick={onSettings}
          title={collapsed ? 'Settings' : undefined}
          aria-label="Open settings"
          className={`
            group
            flex
            w-full
            items-center
            rounded-xl
            text-sm
            font-medium
            text-slate-400
            transition
            hover:bg-slate-900
            hover:text-white
            ${
              collapsed
                ? 'justify-center px-2 py-3'
                : 'gap-3 px-3 py-3'
            }
          `}
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-900
              transition
              group-hover:bg-slate-800
            "
          >

            <Settings
              className="
                h-[18px]
                w-[18px]
                text-slate-500
                transition-transform
                duration-300
                group-hover:rotate-90
                group-hover:text-cyan-400
              "
            />

          </div>

          <span
            className={`
              whitespace-nowrap
              transition-all
              duration-200
              ${
                collapsed
                  ? 'w-0 opacity-0'
                  : 'w-auto opacity-100'
              }
            `}
          >
            Settings
          </span>

        </button>

        {/* SYSTEM STATUS */}

        <div
          className={`
            mt-3
            overflow-hidden
            rounded-xl
            border
            border-emerald-500/10
            bg-emerald-500/[0.035]
            transition-all
            duration-200
            ${
              collapsed
                ? 'mx-auto h-3 w-3 rounded-full border-0 bg-emerald-400 p-0 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                : 'p-3'
            }
          `}
          title={
            collapsed
              ? 'System Online'
              : undefined
          }
        >

          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">

                <span
                  className="
                    h-2
                    w-2
                    animate-pulse
                    rounded-full
                    bg-emerald-400
                    shadow-[0_0_8px_rgba(52,211,153,0.7)]
                  "
                />

                <span className="text-xs font-semibold text-emerald-400">
                  System Online
                </span>

              </div>

              <div className="mt-2 flex items-center justify-between">

                <span className="text-[10px] text-slate-600">
                  Backend services
                </span>

                <span className="text-[10px] font-medium text-slate-500">
                  Healthy
                </span>

              </div>
            </>
          ) : (
            <span className="block h-3 w-3" />
          )}

        </div>

      </div>

    </aside>
  )
}

export default Sidebar
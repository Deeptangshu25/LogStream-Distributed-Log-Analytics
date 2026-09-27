import { useEffect, useState } from 'react'

export const DEFAULT_SETTINGS = {
  animations: true,
  websocket: true,
  autoRefresh: true,
  recentLogs: true,
  compactMode: false,
}

const STORAGE_KEY = 'logstream-settings'
const EVENT_NAME = 'logstream-settings-changed'

function getSavedSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return DEFAULT_SETTINGS
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    }
  } catch (error) {
    console.error(
      'Unable to read LogStream settings',
      error
    )

    return DEFAULT_SETTINGS
  }
}

export function useLogStreamSettings() {
  const [settings, setSettings] = useState(
    getSavedSettings
  )

  useEffect(() => {
    function handleSettingsChange(event) {
      if (!event.detail) {
        return
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...event.detail,
      })
    }

    window.addEventListener(
      EVENT_NAME,
      handleSettingsChange
    )

    return () => {
      window.removeEventListener(
        EVENT_NAME,
        handleSettingsChange
      )
    }
  }, [])

  return settings
}
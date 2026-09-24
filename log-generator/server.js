const axios = require('axios')

const GITHUB_EVENTS_URL = 'https://api.github.com/events'
const LOGSTREAM_URL = 'http://localhost:8081/api/logs'

let lastEventIds = new Set()

function mapLevel(eventType) {
  switch (eventType) {
    case 'PushEvent':
    case 'ReleaseEvent':
    case 'CreateEvent':
      return 'INFO'

    case 'WatchEvent':
    case 'ForkEvent':
      return 'DEBUG'

    case 'IssuesEvent':
    case 'PullRequestEvent':
      return 'WARN'

    case 'DeleteEvent':
      return 'ERROR'

    default:
      return 'INFO'
  }
}

function getMessage(event) {
  const actor = event.actor?.login || 'unknown-user'
  const repo = event.repo?.name || 'unknown-repository'

  switch (event.type) {
    case 'PushEvent':
      return `${actor} pushed changes to ${repo}`

    case 'WatchEvent':
      return `${actor} starred ${repo}`

    case 'ForkEvent':
      return `${actor} forked ${repo}`

    case 'IssuesEvent':
      return `${actor} performed an issue action on ${repo}`

    case 'PullRequestEvent':
      return `${actor} performed a pull request action on ${repo}`

    case 'ReleaseEvent':
      return `${actor} created a release on ${repo}`

    case 'CreateEvent':
      return `${actor} created something in ${repo}`

    case 'DeleteEvent':
      return `${actor} deleted something from ${repo}`

    default:
      return `${actor} generated ${event.type} on ${repo}`
  }
}

function convertToLog(event) {
  const level = mapLevel(event.type)

  return {
    id: `github-${event.id}`,
    timestamp: event.created_at,
    level,
    service: 'github-public-events',
    host: 'api.github.com',
    message: getMessage(event),
    responseTimeMs: Math.floor(Math.random() * 400) + 20,
    traceId: `github-${event.id}`,
  }
}

async function fetchGitHubEvents() {
  try {
    console.log('\n🔄 Fetching GitHub public events...')

    const response = await axios.get(GITHUB_EVENTS_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
      },
      params: {
        per_page: 30,
      },
    })

    const events = response.data

    console.log(`📥 Received ${events.length} GitHub events`)

    let newEvents = 0

    for (const event of events.reverse()) {
      if (lastEventIds.has(event.id)) {
        continue
      }

      lastEventIds.add(event.id)

      const log = convertToLog(event)

      try {
        await axios.post(LOGSTREAM_URL, log)

        console.log(
          `✅ [${log.level}] ${log.service} → ${log.message}`
        )

        newEvents++
      } catch (error) {
        console.error(
          '❌ Failed to send log to LogStream:',
          error.response?.data || error.message
        )
      }
    }

    // Keep memory under control
    if (lastEventIds.size > 500) {
      const ids = Array.from(lastEventIds)
      lastEventIds = new Set(ids.slice(-300))
    }

    console.log(`📤 Sent ${newEvents} new events to LogStream`)
  } catch (error) {
    console.error(
      '❌ GitHub API error:',
      error.response?.data || error.message
    )
  }
}

console.log('🚀 GitHub → LogStream Collector')
console.log('📡 GitHub API:', GITHUB_EVENTS_URL)
console.log('📡 LogStream:', LOGSTREAM_URL)

fetchGitHubEvents()

setInterval(fetchGitHubEvents, 30000)
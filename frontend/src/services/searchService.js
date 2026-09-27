import axios from 'axios'

const searchApi = axios.create({
  baseURL: '/api/logs',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function searchLogs({
  query = '',
  service = '',
  level = '',
  host = '',
  startTime = '',
  endTime = '',
  page = 0,
  size = 20,
} = {}) {
  const response = await searchApi.get('/search', {
    params: {
      query: query || undefined,
      service: service || undefined,
      level: level || undefined,
      host: host || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      page,
      size,
    },
  })

  return response.data
}

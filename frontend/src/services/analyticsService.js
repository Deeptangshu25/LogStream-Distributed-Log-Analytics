import axios from 'axios'

const analyticsApi = axios.create({
  baseURL: '/api/logs',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function getAnalytics() {
  const response = await analyticsApi.get('/analytics')
  return response.data
}

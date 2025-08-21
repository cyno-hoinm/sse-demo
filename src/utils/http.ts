import axios, { AxiosInstance } from 'axios'

const BASE = 'http://localhost:9999/api/v1/notifications'

export const api = (token?: string): AxiosInstance => {
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
}

export const sseUrlWithToken = (token: string): string => `${BASE}/sse?token=${encodeURIComponent(token)}`



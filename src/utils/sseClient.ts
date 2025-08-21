import { sseUrlWithToken } from './http'

export type SSEMessage = {
  id?: number
  user_id?: number
  type?: string
  title?: string
  message?: string
  data?: string | null
  status?: number
  read_at?: string | null
  created_at?: string
  updated_at?: string
  raw?: unknown
}

export const connectToSSE = (token: string, onMessage: (msg: SSEMessage) => void) => {
  const url = sseUrlWithToken(token)
  const es = new EventSource(url)

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage({ ...data, raw: data })
    } catch {
      onMessage({ message: event.data })
    }
  }

  es.onerror = () => {
    // Keep the connection alive; browser will auto-retry
  }

  return es
}



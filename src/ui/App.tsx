import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NotificationsList } from './NotificationsList'
import { connectToSSE, SSEMessage } from '../utils/sseClient'
import { api } from '../utils/http'
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush, getExistingSubscription } from '../utils/webPush'

export const App: React.FC = () => {
  const [token, setToken] = useState<string>('')
  const [events, setEvents] = useState<SSEMessage[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [vapidKey, setVapidKey] = useState<string>('')
  const eventSourceRef = useRef<ReturnType<typeof connectToSSE> | null>(null)

  const isAuthed = token.trim().length > 0

  useEffect(() => {
    if (!isAuthed) return
    const sse = connectToSSE(token, (msg) => setEvents((prev) => [msg, ...prev]))
    eventSourceRef.current = sse
    return () => sse.close()
  }, [isAuthed, token])

  useEffect(() => {
    if (!isAuthed) return
    api(token).get('/unread-count').then((res) => {
      const count = res?.data?.data?.count ?? 0
      setUnreadCount(count)
    }).catch(() => {})
  }, [isAuthed, token])

  useEffect(() => {
    api(token).get('/vapid-public-key').then((res) => setVapidKey(res?.data?.data?.publicKey ?? '')).catch(() => {})
  }, [token])

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service workers are not supported in this browser.')
      return
    }
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') return
    try {
      const sub = await subscribeToPush(vapidKey)
      if (!sub) return
      const body = {
        endpoint: sub.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('p256dh')!)) as unknown as number[])),
        auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('auth')!)) as unknown as number[]))
      }
      await api(token).post('/web-push/subscribe', body)
      alert('Subscribed to Web Push!')
    } catch (e) {
      console.error(e)
      alert('Failed to subscribe')
    }
  }

  const handleUnsubscribe = async () => {
    try {
      const existing = await getExistingSubscription()
      if (!existing) return
      // Fetch all subs and delete the one that matches endpoint
      const res = await api(token).get('/web-push/subscriptions')
      const subs: Array<{ id: number; endpoint: string }> = res?.data?.data?.subscriptions ?? []
      const match = subs.find(s => s.endpoint === existing.endpoint)
      if (match) {
        await api(token).delete(`/web-push/subscriptions/${match.id}`)
      }
      await unsubscribeFromPush()
      alert('Unsubscribed from Web Push')
    } catch (e) {
      console.error(e)
      alert('Failed to unsubscribe')
    }
  }

  const triggerButtons = useMemo(() => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
      {[
        ['Post Published', '/test/post-published'],
        ['Page Published', '/test/page-published'],
        ['Comment Reply', '/test/comment-reply'],
        ['Contact Message', '/test/contact-message'],
        ['Email Subscription', '/test/email-subscription'],
        ['System Update', '/test/system-update']
      ].map(([label, path]) => (
        <button key={path} onClick={() => api(token).post(path)}>{label}</button>
      ))}
    </div>
  ), [token])

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h2>SSE + Web Push Notifications</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <input
          placeholder="JWT token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <span style={{ fontSize: 12, color: '#666' }}>Unread: {unreadCount}</span>
      </div>

      {isAuthed ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={handleSubscribe} disabled={!vapidKey}>Enable Web Push</button>
            <button onClick={handleUnsubscribe}>Disable Web Push</button>
            <button onClick={() => api(token).patch('/read-all').then(() => setUnreadCount(0))}>Mark all read</button>
            <button onClick={() => api(token).get('/unread-count').then((r) => setUnreadCount(r?.data?.data?.count ?? 0))}>Refresh count</button>
          </div>
          {triggerButtons}
          <hr style={{ margin: '16px 0' }} />
          <NotificationsList events={events} token={token} onRead={(id) => api(token).patch(`/${id}/read`)} onDelete={(id) => api(token).delete(`/${id}`)} />
        </>
      ) : (
        <p>Enter a JWT to connect.</p>
      )}
    </div>
  )
}



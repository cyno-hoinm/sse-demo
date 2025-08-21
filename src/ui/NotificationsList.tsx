import React from 'react'
import { SSEMessage } from '../utils/sseClient'

type Props = {
  events: SSEMessage[]
  token: string
  onRead: (id: number) => void
  onDelete: (id: number) => void
}

export const NotificationsList: React.FC<Props> = ({ events, onRead, onDelete }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.length === 0 && <div>No events yet. Trigger one above or wait for SSE.</div>}
      {events.map((evt) => (
        <div key={evt.id ?? Math.random()} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{evt.title ?? evt.type}</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              {evt.id != null && <button onClick={() => onRead(evt.id!)}>Mark read</button>}
              {evt.id != null && <button onClick={() => onDelete(evt.id!)}>Delete</button>}
            </div>
          </div>
          {evt.message && <div style={{ marginTop: 6 }}>{evt.message}</div>}
          {evt.created_at && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(evt.created_at).toLocaleString()}</div>}
          {evt.raw && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(evt.raw, null, 2)}</pre>}
        </div>
      ))}
    </div>
  )
}



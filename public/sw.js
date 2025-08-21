self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json?.() || JSON.parse(event.data?.text?.() || '{}')
  } catch (e) {}
  const title = data.title || 'New Notification'
  const options = {
    body: data.message || '',
    data,
    icon: '/favicon.svg',
    badge: '/favicon.svg'
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(self.clients.openWindow(url))
})



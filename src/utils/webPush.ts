export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null
  return await navigator.serviceWorker.register('/sw.js')
}

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const subscribeToPush = async (vapidPublicKey: string): Promise<PushSubscription | null> => {
  const reg = await registerServiceWorker()
  if (!reg) return null
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing
  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  })
}

export const getExistingSubscription = async (): Promise<PushSubscription | null> => {
  const reg = await registerServiceWorker()
  if (!reg) return null
  return await reg.pushManager.getSubscription()
}

export const unsubscribeFromPush = async (): Promise<boolean> => {
  const sub = await getExistingSubscription()
  if (!sub) return false
  return await sub.unsubscribe()
}



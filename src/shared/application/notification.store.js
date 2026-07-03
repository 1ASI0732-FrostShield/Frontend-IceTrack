import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NotificationsApi } from '@/shared/infrastructure/notifications-api.js'
const notificationsApi = new NotificationsApi()

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const panelOpen = ref(false)

  const alerts = computed(() =>
    notifications.value.filter(n => !n.dismissedAt)
  )

  const hasAlerts = computed(() => alerts.value.length > 0)
  const alertCount = computed(() => alerts.value.length)

  async function fetchNotifications () {
    loading.value = true
    try {
      const res = await notificationsApi.getAllActive()
      notifications.value = Array.isArray(res.data) ? res.data : []
    } catch {
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  async function dismissAlert (notificationId) {
    try {
      await notificationsApi.dismiss(notificationId)
      const idx = notifications.value.findIndex(n => n.id === notificationId)
      if (idx !== -1) {
        notifications.value[idx] = { ...notifications.value[idx], dismissedAt: new Date().toISOString() }
      }
    } catch (err) {
      console.warn('[notifications] Error al descartar notificación:', err)
    }
  }

  function togglePanel () {
    panelOpen.value = !panelOpen.value
  }

  function closePanel () {
    panelOpen.value = false
  }

  return {
    notifications, alerts, hasAlerts, alertCount, loading, panelOpen,
    fetchNotifications, dismissAlert,
    togglePanel, closePanel
  }
})

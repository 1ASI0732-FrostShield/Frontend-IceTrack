import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import useMonitoringStore from '@/monitoring/application/monitoring.store.js'
import useAssetsManagementStore from '@/assets-management/application/assets-management.store.js'

const SETTINGS_KEY = 'icetrack-reminder-settings'

export const useNotificationStore = defineStore('notification', () => {
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
    } catch { return {} }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  const reminderSettings = ref(loadSettings())
  const panelOpen = ref(false)

  const alerts = computed(() => {
    const monitoringStore = useMonitoringStore()
    const assetsStore = useAssetsManagementStore()
    const equipments = monitoringStore.equipments || []
    const sites = assetsStore.sites || []
    const now = new Date()
    const settings = reminderSettings.value
    const result = []

    for (const eq of equipments) {
      const s = settings[eq.id]
      if (!s || !s.intervalDays) continue

      const lastDismissed = s.lastDismissedAt
        ? new Date(s.lastDismissedAt)
        : eq.created
          ? new Date(eq.created)
          : now

      const dueDate = new Date(lastDismissed)
      dueDate.setDate(dueDate.getDate() + s.intervalDays)

      if (now >= dueDate) {
        const site = sites.find(site => site.id === eq.siteId)
        result.push({
          equipmentId: eq.id,
          equipmentName: eq.model || eq.name,
          siteName: site ? site.name : '',
          message: `Mantenimiento programado cada ${s.intervalDays} d\u00edas`,
          dueDate: dueDate.toISOString(),
          intervalDays: s.intervalDays
        })
      }
    }
    return result
  })

  const hasAlerts = computed(() => alerts.value.length > 0)
  const alertCount = computed(() => alerts.value.length)

  function setReminderInterval(equipmentId, intervalDays) {
    const settings = { ...reminderSettings.value }
    if (intervalDays == null || intervalDays === 0) {
      delete settings[equipmentId]
    } else {
      settings[equipmentId] = {
        intervalDays,
        lastDismissedAt: settings[equipmentId]?.lastDismissedAt || null
      }
    }
    reminderSettings.value = settings
    saveSettings(settings)
  }

  function getReminderInterval(equipmentId) {
    const s = reminderSettings.value[equipmentId]
    return s ? s.intervalDays : null
  }

  function dismissAlert(equipmentId) {
    const settings = { ...reminderSettings.value }
    if (settings[equipmentId]) {
      settings[equipmentId].lastDismissedAt = new Date().toISOString()
      reminderSettings.value = settings
      saveSettings(settings)
    }
  }

  function togglePanel() {
    panelOpen.value = !panelOpen.value
  }

  function closePanel() {
    panelOpen.value = false
  }

  return {
    alerts, hasAlerts, alertCount, panelOpen,
    setReminderInterval, getReminderInterval, dismissAlert,
    togglePanel, closePanel
  }
})

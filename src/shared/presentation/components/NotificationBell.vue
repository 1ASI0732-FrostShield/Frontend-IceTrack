<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/shared/application/notification.store.js'
import { useI18n } from '@/i18n.js'

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()

function handleToggle () {
  notificationStore.togglePanel()
}

function handleDismiss (e, notificationId) {
  e.stopPropagation()
  notificationStore.dismissAlert(notificationId)
}

function handleClickOutside (e) {
  const el = document.querySelector('.notification-bell-wrapper')
  if (el && !el.contains(e.target)) {
    notificationStore.closePanel()
  }
}

function goToNotifications () {
  notificationStore.closePanel()
  router.push('/notifications')
}

onMounted(() => {
  notificationStore.fetchNotifications()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="notification-bell-wrapper" style="position:relative; display:inline-block;">
    <button
      class="bell-button"
      @click="handleToggle"
      :aria-label="t('notifications.title')"
    >
      <i class="pi pi-bell" style="font-size:1.25rem;"></i>
      <span v-if="notificationStore.hasAlerts" class="bell-dot"></span>
    </button>

    <div v-if="notificationStore.panelOpen" class="notification-panel">
      <div class="panel-header">
        <strong>{{ t('notifications.title') }}</strong>
        <span class="badge-count">{{ notificationStore.alertCount }}</span>
      </div>

      <div class="panel-body">
        <div v-if="notificationStore.loading" class="panel-empty">Cargando...</div>

        <div v-else-if="notificationStore.alerts.length === 0" class="panel-empty">
          {{ t('notifications.empty') }}
        </div>

        <div
          v-for="alert in notificationStore.alerts"
          :key="alert.id"
          class="alert-item"
        >
          <div class="alert-content">
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-date">{{ new Date(alert.createdAt).toLocaleDateString('es-PE') }}</div>
          </div>
          <button class="alert-dismiss" @click="handleDismiss($event, alert.id)" title="Descartar">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <div class="panel-footer" @click="goToNotifications">
        Ver todas las notificaciones
      </div>
    </div>
  </div>
</template>

<style scoped>
.bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text, #333);
}
.bell-button:hover {
  background: var(--app-surface-muted, #f0f0f0);
}
.bell-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  background: #e53935;
  border-radius: 50%;
  border: 2px solid var(--app-surface, #fff);
}
.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--app-surface, #fff);
  border: 1px solid var(--app-border, #ddd);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 1000;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--app-border, #eee);
  font-size: 14px;
}
.badge-count {
  background: var(--app-primary, #0891b2);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.panel-body {
  padding: 8px 0;
}
.panel-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--app-text-muted, #888);
  font-size: 13px;
}
.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--app-border, #f5f5f5);
}
.alert-item:last-child {
  border-bottom: none;
}
.alert-content {
  flex: 1;
  min-width: 0;
}
.alert-message {
  font-size: 12px;
  color: var(--app-text, #444);
  line-height: 1.4;
}
.alert-date {
  font-size: 11px;
  color: var(--app-text-muted, #999);
  margin-top: 4px;
}
.alert-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--app-text-muted, #999);
  font-size: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.alert-dismiss:hover {
  background: var(--app-surface-muted, #f0f0f0);
  color: var(--app-text, #333);
}
.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--app-border, #eee);
  text-align: center;
  font-size: 13px;
  color: var(--app-primary, #0891b2);
  cursor: pointer;
  font-weight: 600;
}
.panel-footer:hover {
  background: var(--app-surface-muted, #f8f8f8);
}
</style>

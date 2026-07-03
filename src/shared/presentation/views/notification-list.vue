<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/shared/application/notification.store.js'
import { useI18n } from '@/i18n.js'

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()

function handleDismiss (notificationId) {
  notificationStore.dismissAlert(notificationId)
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>

<template>
  <section class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('notifications.title') }}</h1>
      <pv-button
        icon="pi pi-arrow-left"
        :label="t('common.back')"
        text
        severity="secondary"
        @click="router.back()"
      />
    </div>

    <pv-data-table
      :value="notificationStore.notifications"
      :loading="notificationStore.loading"
      striped-rows
      table-style="min-width: 50rem"
    >
      <pv-column field="message" :header="t('notifications.title')">
        <template #body="{ data }">
          <span :style="{ opacity: data.dismissedAt ? 0.5 : 1 }">{{ data.message }}</span>
        </template>
      </pv-column>

      <pv-column field="type" header="Tipo" style="width: 120px">
        <template #body="{ data }">
          <pv-tag
            :value="data.type === 'maintenance_reminder' ? 'Mantenimiento' : data.type"
            :severity="data.type === 'maintenance_reminder' ? 'warn' : 'info'"
          />
        </template>
      </pv-column>

      <pv-column field="createdAt" header="Fecha" style="width: 140px">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
        </template>
      </pv-column>

      <pv-column field="isRead" header="Estado" style="width: 100px">
        <template #body="{ data }">
          <pv-tag
            v-if="data.dismissedAt"
            value="Descartada"
            severity="secondary"
          />
          <pv-tag
            v-else
            value="Pendiente"
            severity="danger"
          />
        </template>
      </pv-column>

      <pv-column header="" style="width: 80px">
        <template #body="{ data }">
          <pv-button
            v-if="!data.dismissedAt"
            icon="pi pi-check"
            text
            rounded
            severity="secondary"
            v-tooltip.top="'Descartar'"
            @click="handleDismiss(data.id)"
          />
        </template>
      </pv-column>

      <template #empty>
        No hay notificaciones
      </template>
    </pv-data-table>
  </section>
</template>

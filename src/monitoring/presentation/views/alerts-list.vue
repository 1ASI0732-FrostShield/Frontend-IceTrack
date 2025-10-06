<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const alerts = ref([])

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/alerts')
    alerts.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

const severityOptions = [
  { label: 'Crítica', value: 'critical' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Info', value: 'info' }
]
const statusOptions = [
  { label: 'Abierta', value: 'open' },
  { label: 'Resuelta', value: 'resolved' },
  { label: 'Cerrada', value: 'closed' },
  { label: 'Ack', value: 'acknowledged' }
]
const siteOptions = [
  { label: 'Sitio 1', value: 's1' },
  { label: 'Sitio 2', value: 's2' },
  { label: 'Sitio 3', value: 's3' }
]
const equipmentOptions = [
  { label: 'Equipo 1', value: 'e1' },
  { label: 'Equipo 2', value: 'e2' },
  { label: 'Equipo 3', value: 'e3' },
  { label: 'Equipo 4', value: 'e4' }
]
const dateOptions = [
  { label: 'Hoy', value: 'today' },
  { label: 'Últimos 7 días', value: 'week' },
  { label: 'Último mes', value: 'month' }
]
</script>

<template>
  <section class="alerts">
    <h1>{{ t('alerts.list.title') }}</h1>

    <!-- Filtros -->
    <div class="filters">
      <pv-dropdown :options="severityOptions" optionLabel="label" optionValue="value" placeholder="Severidad" />
      <pv-dropdown :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Estado" />
      <pv-dropdown :options="siteOptions" optionLabel="label" optionValue="value" placeholder="Sitio" />
      <pv-dropdown :options="equipmentOptions" optionLabel="label" optionValue="value" placeholder="Equipo" />
      <pv-dropdown :options="dateOptions" optionLabel="label" optionValue="value" placeholder="Rango de fechas" />
    </div>

    <!-- Tabla -->
    <table class="alerts-table">
      <thead>
      <tr>
        <th>{{ t('alerts.fields.createdAt') }}</th>
        <th>{{ t('alerts.fields.equipment') }}</th>
        <th>{{ t('alerts.fields.site') }}</th>
        <th>{{ t('alerts.fields.type') }}</th>
        <th>{{ t('alerts.fields.severity') }}</th>
        <th>{{ t('alerts.fields.status') }}</th>
        <th>{{ t('alerts.fields.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="alert in alerts" :key="alert.id">
        <td>{{ new Date(alert.createdAt).toLocaleString() }}</td>
        <td>Equipo {{ alert.equipmentId }}</td>
        <td>Sitio {{ alert.siteId }}</td>
        <td>{{ alert.type }}</td>
        <td>
            <span :class="['badge', alert.severity]">
              {{ alert.severity.toUpperCase() }}
            </span>
        </td>
        <td class="status">
          <span v-if="alert.status === 'open'">ABIERTA</span>
          <span v-else-if="alert.status === 'resolved'">RESUELTA</span>
          <span v-else-if="alert.status === 'closed'">CERRADA</span>
          <span v-else-if="alert.status === 'acknowledged'">ACK</span>
        </td>
        <td class="action">
          ACK /
          <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: alert.equipmentId } }">Ver</RouterLink>
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.alerts {
  padding: 1rem;
}

.alerts h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.alerts-table {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  overflow: hidden;
  border-collapse: collapse;
}

.alerts-table th {
  background: #f9fafb;
  text-align: left;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.75rem 1rem;
}

.alerts-table td {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.alerts-table tr:hover {
  background: #f9fafb;
}

/* Badges de severidad */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.critical {
  background: #fee2e2;
  color: #dc2626;
}

.badge.warning {
  background: #fef9c3;
  color: #ca8a04;
}

.badge.info {
  background: #dbeafe;
  color: #2563eb;
}

.status {
  text-transform: uppercase;
}

.action {
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
}
</style>

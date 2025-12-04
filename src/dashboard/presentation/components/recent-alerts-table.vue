<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

function formatDate(dateString) {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US')
}

function getSeverityClass(severity) {
  const severityMap = {
    'critical': 'danger',
    'warning': 'warning',
    'info': 'info'
  }
  return severityMap[severity] || 'info'
}
</script>

<template>
  <pv-card>
    <template #title>{{ $t('dashboard.recentAlerts') }}</template>
    <template #content>
      <div v-if="!items || items.length === 0" class="text-center p-4">
        {{ $t('dashboard.alerts.noAlerts') }}
      </div>

      <pv-data-table v-else :value="items" size="small" :paginator="false">
        <pv-column :header="$t('dashboard.alerts.columns.date')" style="width: 20%">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </pv-column>

        <pv-column
            field="equipmentName"
            :header="$t('dashboard.alerts.columns.equipment')"
            style="width: 20%"
        />

        <pv-column
            field="siteName"
            :header="$t('dashboard.alerts.columns.site')"
            style="width: 15%"
        />

        <pv-column :header="$t('dashboard.alerts.columns.severity')" style="width: 15%">
          <template #body="{ data }">
            <pv-tag
                :value="$t(`dashboard.alerts.severities.${data.severity}`)"
                :severity="getSeverityClass(data.severity)"
            />
          </template>
        </pv-column>

        <pv-column :header="$t('dashboard.alerts.columns.status')" style="width: 15%">
          <template #body="{ data }">
            {{ $t(`dashboard.alerts.statuses.${data.status}`) }}
          </template>
        </pv-column>

        <pv-column :header="$t('dashboard.alerts.columns.action')" style="width: 15%">
          <template #body>
            <pv-button
                :label="$t('dashboard.alerts.actions.acknowledge')"
                text
                disabled
                size="small"
            />
          </template>
        </pv-column>
      </pv-data-table>
    </template>
  </pv-card>
</template>
<script setup>
import { onMounted } from 'vue'
import { dashboardStore } from '../../application/dashboard.store.js'
import KpiCards from '../components/kpi-cards.vue'
import TrendChart from '../components/trend-chart.vue'
import RecentAlertsTable from '../components/recent-alerts-table.vue'

onMounted(() => {
  dashboardStore.loadAll()
})

function refreshDashboard() {
  dashboardStore.loadAll()
}
</script>

<template>
  <div class="p-3">
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold">{{ $t('dashboard.title') }}</h1>

      <div v-if="dashboardStore.snapshot" class="flex gap-2">
        <pv-tag severity="info">
          Min: {{ dashboardStore.statistics.minTemperature?.toFixed(1) }}°C
        </pv-tag>
        <pv-tag severity="warning">
          Max: {{ dashboardStore.statistics.maxTemperature?.toFixed(1) }}°C
        </pv-tag>
      </div>
    </div>

    <div v-if="dashboardStore.loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner text-4xl"></i>
      <p class="mt-2">Cargando dashboard...</p>
    </div>

    <div v-if="dashboardStore.errors.length > 0" class="mb-3">
      <div class="surface-100 border-1 border-red-500 border-round p-3">
        <div class="flex align-items-center justify-content-between">
          <div>
            <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
            <span class="font-semibold">Se encontraron errores:</span>
          </div>
          <pv-button
              icon="pi pi-times"
              text
              severity="danger"
              @click="dashboardStore.clearErrors()"
          />
        </div>
        <ul class="mt-2 mb-0">
          <li v-for="(error, idx) in dashboardStore.errors" :key="idx" class="text-red-600">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <template v-if="!dashboardStore.loading">
      <div v-if="dashboardStore.snapshot" class="mb-4">
        <kpi-cards :snapshot="dashboardStore.snapshot" />
      </div>
      <div v-else-if="!dashboardStore.errors.length" class="text-center p-4 mb-4 surface-100 border-round">
        <i class="pi pi-inbox text-4xl text-400"></i>
        <p class="mt-2 text-600">Sin datos de dashboard para este tenant</p>
      </div>

      <pv-card v-if="dashboardStore.snapshot" class="mb-4">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span>{{ $t('dashboard.chartTitle') }}</span>
            <pv-tag v-if="dashboardStore.statistics.totalDataPoints">
              {{ dashboardStore.statistics.totalDataPoints }} puntos
            </pv-tag>
          </div>
        </template>
        <template #content>
          <trend-chart :snapshot="dashboardStore.snapshot" />
        </template>
      </pv-card>

      <div class="position-relative">
        <div v-if="dashboardStore.loadingAlerts" class="absolute top-0 right-0 p-2">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <recent-alerts-table :items="dashboardStore.alerts" />
      </div>
    </template>

    <div class="fixed bottom-0 right-0 p-3">
      <pv-button
          icon="pi pi-refresh"
          rounded
          severity="secondary"
          @click="refreshDashboard"
          :loading="dashboardStore.loading"
          v-tooltip="'Recargar dashboard'"
      />
    </div>
  </div>
</template>

<style scoped>
.position-relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.fixed {
  position: fixed;
}
</style>
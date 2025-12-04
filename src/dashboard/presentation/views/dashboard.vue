<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore } from '@/dashboard/application/dashboard-data.store.js'
import KpiCards from '../components/kpi-cards.vue'
import TrendChart from '../components/trend-chart.vue'
import DashboardConfigTable from '../components/dashboard-config-table.vue'

const { t } = useI18n()
const configStore = useDashboardConfigStore()
const dataStore = useDashboardDataStore()

onMounted(async () => {
  // Cargar configuración del dashboard (API real)
  await configStore.loadConfigForCurrentUser()
  await configStore.loadAvailableCardTypes()

  // Cargar datos mock para KPIs y gráfico
  dataStore.useMockKpis()
  dataStore.useMockChartData()
})

function refreshDashboard() {
  configStore.loadConfigForCurrentUser()
  dataStore.useMockKpis()
  dataStore.useMockChartData()
}
</script>

<template>
  <div class="p-3">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold">{{ t('dashboard.title') }}</h1>

      <div v-if="dataStore.kpis" class="flex gap-2">
        <pv-tag severity="info">
          Min: {{ dataStore.statistics.minTemperature?.toFixed(1) }}°C
        </pv-tag>
        <pv-tag severity="warning">
          Max: {{ dataStore.statistics.maxTemperature?.toFixed(1) }}°C
        </pv-tag>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="configStore.loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner text-4xl"></i>
      <p class="mt-2">{{ t('dashboard.loading') }}</p>
    </div>

    <!-- Errors -->
    <div v-if="configStore.errors.length > 0" class="mb-3">
      <div class="surface-100 border-1 border-red-500 border-round p-3">
        <div class="flex align-items-center justify-content-between">
          <div>
            <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
            <span class="font-semibold">{{ t('dashboard.errors.title') }}</span>
          </div>
          <pv-button
              icon="pi pi-times"
              text
              severity="danger"
              @click="configStore.clearErrors()"
          />
        </div>
        <ul class="mt-2 mb-0">
          <li v-for="(error, idx) in configStore.errors" :key="idx" class="text-red-600">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Dashboard Content -->
    <template v-if="!configStore.loading">
      <!-- KPI Cards (Horizontales) -->
      <div v-if="dataStore.kpis" class="mb-4">
        <kpi-cards :kpis="dataStore.kpis" />
      </div>

      <div v-else-if="!configStore.errors.length" class="text-center p-4 mb-4 surface-100 border-round">
        <i class="pi pi-inbox text-4xl text-400"></i>
        <p class="mt-2 text-600">{{ t('dashboard.noConfig') }}</p>
      </div>

      <!-- Temperature Chart -->
      <pv-card v-if="dataStore.kpis" class="mb-4">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span>{{ t('dashboard.chartTitle') }}</span>
            <pv-tag v-if="dataStore.statistics.totalDataPoints">
              {{ dataStore.statistics.totalDataPoints }} puntos
            </pv-tag>
          </div>
        </template>
        <template #content>
          <trend-chart :chartData="dataStore.temperatureChartData" />
        </template>
      </pv-card>

      <!-- Dashboard Config CRUD Table -->
      <div class="position-relative">
        <dashboard-config-table v-if="configStore.config" :config="configStore.config" />
      </div>
    </template>

    <!-- Floating Refresh Button -->
    <div class="fixed bottom-0 right-0 p-3">
      <pv-button
          icon="pi pi-refresh"
          rounded
          severity="secondary"
          @click="refreshDashboard"
          :loading="configStore.loading"
          v-tooltip="t('dashboard.refresh')"
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
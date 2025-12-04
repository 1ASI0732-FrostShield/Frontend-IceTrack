<script setup>
import { onMounted, computed } from 'vue'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore } from '@/dashboard/application/dashboard-data.store.js'
import DashboardConfigTable from '../components/dashboard-config-table.vue'

const configStore = useDashboardConfigStore()
const dataStore = useDashboardDataStore()

onMounted(async () => {
  await configStore.loadConfigForCurrentUser()
  await configStore.loadAvailableCardTypes()
  await dataStore.loadAll(configStore.defaultSiteId)
})

function refreshDashboard() {
  configStore.loadConfigForCurrentUser()
  dataStore.loadAll(configStore.defaultSiteId)
}

const visibleCards = computed(() => {
  if (!configStore.config) return []
  return configStore.visibleCards
})

function getKpiValue(cardType) {
  if (!dataStore.kpis) return '--'

  const kpiMap = {
    'MonitoredEquipment': dataStore.kpis.totalEquipments || '--',
    'OpenAlerts': dataStore.kpis.openAlerts || '--',
    'ActiveOrders': dataStore.kpis.activeRequests || '--',
    'AverageTemperature': dataStore.kpis.getFormattedAvgTemp(),
    'RecentReports': '--',
    'EquipmentStatus': '--',
    'SystemHealth': '--'
  }

  return kpiMap[cardType] ?? '--'
}

function getCardIcon(cardType) {
  const iconMap = {
    'MonitoredEquipment': 'pi-sitemap',
    'OpenAlerts': 'pi-exclamation-triangle',
    'ActiveOrders': 'pi-briefcase',
    'AverageTemperature': 'pi-chart-scatter',
    'TemperatureTrends': 'pi-chart-line',
    'RecentReports': 'pi-file',
    'EquipmentStatus': 'pi-server',
    'SystemHealth': 'pi-heart'
  }
  return iconMap[cardType] || 'pi-th-large'
}

function getCardColor(cardType) {
  const colorMap = {
    'MonitoredEquipment': 'text-primary',
    'OpenAlerts': 'text-orange-500',
    'ActiveOrders': 'text-green-500',
    'AverageTemperature': 'text-blue-500'
  }
  return colorMap[cardType] || 'text-gray-500'
}

function getCardTitle(cardType) {
  const titleMap = {
    'MonitoredEquipment': 'Monitored Equipment',
    'OpenAlerts': 'Open Alerts',
    'ActiveOrders': 'Active Orders',
    'AverageTemperature': 'Average Temperature',
    'TemperatureTrends': 'Temperature Trends',
    'RecentReports': 'Recent Reports',
    'EquipmentStatus': 'Equipment Status',
    'SystemHealth': 'System Health'
  }
  return titleMap[cardType] || cardType
}

// Solo KPI cards (sin chart)
const kpiCards = computed(() => {
  return visibleCards.value.filter(card =>
      card.cardType !== 'TemperatureTrends'
  )
})
</script>

<template>
  <div class="p-3">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <pv-button
          icon="pi pi-refresh"
          label="Refresh"
          @click="refreshDashboard"
          :loading="configStore.loading || dataStore.loading"
          outlined
      />
    </div>

    <!-- Loading -->
    <div v-if="configStore.loading || dataStore.loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner text-4xl"></i>
      <p class="mt-2">Loading...</p>
    </div>

    <!-- Errors -->
    <div v-if="configStore.errors.length > 0 || dataStore.errors.length > 0" class="mb-3">
      <div class="surface-100 border-1 border-red-500 border-round p-3">
        <div class="flex align-items-center justify-content-between">
          <div>
            <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
            <span class="font-semibold">Errors</span>
          </div>
          <pv-button icon="pi pi-times" text severity="danger" @click="configStore.clearErrors(); dataStore.clearErrors()" />
        </div>
        <ul class="mt-2 mb-0">
          <li v-for="(error, idx) in [...configStore.errors, ...dataStore.errors]" :key="idx" class="text-red-600">{{ error }}</li>
        </ul>
      </div>
    </div>

    <!-- Dashboard Content -->
    <template v-if="!configStore.loading && !dataStore.loading">

      <!-- KPI Cards (respetando configuración del usuario) -->
      <div v-if="kpiCards.length > 0" class="grid mb-4">
        <div v-for="card in kpiCards" :key="card.id" class="col-12 md:col-6 lg:col-3">
          <pv-card class="h-full">
            <template #title>
              <div class="flex align-items-center justify-content-between w-full">
                <span class="text-lg">{{ getCardTitle(card.cardType) }}</span>
                <i :class="`pi ${getCardIcon(card.cardType)}`"></i>
              </div>
            </template>
            <template #content>
              <div class="text-4xl font-bold" :class="getCardColor(card.cardType)">
                {{ getKpiValue(card.cardType) }}
              </div>
              <div v-if="!dataStore.hasData" class="text-sm text-500 mt-2">
                No data available
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <!-- No Cards Message -->
      <div v-if="kpiCards.length === 0" class="text-center p-4 mb-4 surface-100 border-round">
        <i class="pi pi-inbox text-4xl text-400"></i>
        <p class="mt-2 text-600">No cards visible in your dashboard</p>
        <p class="text-500">Use the configuration panel below to add cards</p>
      </div>

      <!-- Dashboard Configuration CRUD Table -->
      <dashboard-config-table v-if="configStore.config" :config="configStore.config" />
    </template>
  </div>
</template>